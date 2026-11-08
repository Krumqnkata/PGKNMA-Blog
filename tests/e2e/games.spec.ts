import { expect, test, type Page } from '@playwright/test';
import type { GameSession, GameSlug } from '../../src/lib/games-api';

const user = { id: 77, username: 'game_reader', email: 'player@example.test', has_password: true, site_role: null, avatar_url: null, equipped_rewards: [] };
const titles: Record<GameSlug,string> = { quiz:'Дневна викторина', word:'Познай думата', code:'Разбий кода', robot:'Подреди алгоритъма', memory:'Открий двойките', hunt:'Лов на следи' };
const base = { id: '11111111-1111-4111-8111-111111111111', puzzle_id:'22222222-2222-4222-8222-222222222222', mode:'daily' as const, status:'active' as const, revision:0, expires_at:'2099-10-06T00:00:00+03:00', reward_eligible:true, points_awarded:0, score:null, earned_today:0, daily_cap:30 };
function fixture(game: GameSlug): GameSession {
  switch(game) {
    case 'quiz': return { ...base, game, state:{ answered:0,total:5,question:{text:'Колко е 2 + 2?',options:['4','3','5','6']} } };
    case 'word': return { ...base, game, state:{hint:'Технология',letters:[],masked:['_','_','_'],remaining:6} };
    case 'code': return { ...base, game, state:{guesses:[],remaining:8} };
    case 'robot': return { ...base, game, state:{start:[0,0],goal:[1,0],walls:[],direction:0,commands:['forward','right'],attempts:[],remaining:5} };
    case 'memory': return { ...base, game, state:{cards:Array(16).fill(null),matched:[],open:[],turns:0,remaining:20} };
    case 'hunt': return { ...base, game, state:{title:'Учебен опит',text:'За основен инструмент екипът избира сензор.',question:'Какъв е основният инструмент?',answers:[],remaining:3} };
  }
}

async function setup(page: Page, game: GameSlug = 'code', signedIn = true, disconnectOnce = false) {
  if (signedIn) await page.addInitScript(account => { localStorage.setItem('accessToken','game-test-token'); localStorage.setItem('user',JSON.stringify(account)); }, user);
  const session = fixture(game);
  let disconnected = false;
  const actions: unknown[] = [];
  const receipts = new Set<string>();
  const catalog = () => ({enabled:true,start_date:'2026-10-05',day:'2026-10-05',daily_cap:30,earned_today:session.earned_today,games:(Object.keys(titles) as GameSlug[]).map(slug=>({slug,title:titles[slug],rules:'Реши задачата и спечели точки.',icon:'🎮',points:5,daily_status:slug===game&&session.status!=='active'?session.status:null,best_score:null,wins:0}))});
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/games/')return route.fulfill({json:catalog()});
    if(path.endsWith('/actions/')) {
      const body=route.request().postDataJSON();
      actions.push(body);
      if(!receipts.has(body.request_id)) {
        receipts.add(body.request_id);
        session.revision++;
        if(session.game==='quiz') { session.state.answered++; if(session.state.answered===5) { delete session.state.question; session.status='won'; } }
        if(session.game==='word') { session.state.letters.push(body.action.letter);session.state.masked=Array.from('КОД').map(c=>session.game==='word'&&session.state.letters.includes(c)?c:'_');if(!session.state.masked.includes('_'))session.status='won'; }
        if(session.game==='code') {session.state.guesses=[{guess:body.action.guess,exact:4,misplaced:0}];session.state.solution='0123';session.status='won';}
        if(session.game==='robot') {expect(body.action.order).toEqual([1,0]);session.status='won';}
        if(session.game==='memory') { const i=body.action.index;session.state.cards[i]='🍎';session.state.matched.push(i);if(session.state.matched.length===16)session.status='won'; }
        if(session.game==='hunt') {session.state.answers=[body.action.answer];session.state.solution='сензор';session.status='won';}
        if(session.status==='won'){session.points_awarded=5;session.earned_today=5;}
      }
      if(disconnectOnce&&!disconnected){disconnected=true;return route.abort('failed');}
      return route.fulfill({json:session});
    }
    if(path==='/api/games/sessions/'&&route.request().method()==='POST')return route.fulfill({json:session});
    if(path.startsWith('/api/games/sessions/'))return route.fulfill({json:session});
    if(path.endsWith('/api/profile/'))return route.fulfill({json:{user}});
    if(path.endsWith('/api/site-status/'))return route.fulfill({json:{maintenance_mode:false,enable_weekly_poll:true}});
    if(path.endsWith('/api/privacy-policy/'))return route.fulfill({json:{date:'2026-10-05',content:'Политика'}});
    if(path.endsWith('/api/push/config/'))return route.fulfill({json:{enabled:false}});
    return route.fulfill({json:[]});
  });
  return { actions };
}

async function dismissCookies(page:Page) {
  const button=page.getByRole('button',{name:'Само необходими'});
  await button.waitFor({state:'visible',timeout:3000}).catch(()=>{});
  if(await button.isVisible())await button.click();
}

test('guests discover all six games and open login',async({page})=>{
  await setup(page,'code',false);
  await page.goto('/games');await dismissCookies(page);
  for(const title of Object.values(titles))await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
  await page.getByRole('link').filter({has:page.getByRole('heading',{name:'Разбий кода',exact:true})}).click();
  await page.getByRole('button',{name:'Влез и играй',exact:true}).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fgames%2Fcode$/);
  await expect(page.getByRole('heading',{name:'Добре дошли'})).toBeVisible();
});

test('a finished game shows how it ended, with its next steps',async({page})=>{
  await setup(page,'code');
  let status:GameSession['status']='lost';
  await page.route('**/api/games/sessions/**',route=>route.fulfill({json:{...fixture('code'),status}}));
  await page.goto(`/games/code?session=${base.id}`);await dismissCookies(page);
  await expect(page.getByRole('heading',{name:'Този опит приключи'})).toBeVisible();
  await expect(page.getByText('Следващото предизвикателство те очаква.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Упражни същата задача'})).toBeVisible();
  status='expired';
  await page.reload();
  await expect(page.getByRole('heading',{name:'Времето на тази сесия изтече'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Следваща игра'})).toBeVisible();
});

for(const game of Object.keys(titles) as GameSlug[]) {
  test(`${game}: play, save reward, restore after reload`,async({page},testInfo)=>{
    await setup(page,game);
    await page.goto(`/games/${game}`);await dismissCookies(page);
    await page.getByRole('button',{name:'Дневно предизвикателство',exact:true}).click();
    await expect(page.getByRole('region',{name:'Игрово поле'})).toBeVisible();
    if(game==='quiz')for(let i=0;i<5;i++){await expect(page.getByText(`Въпрос ${i+1} от 5`)).toBeVisible();await page.getByRole('button',{name:'А 4',exact:true}).click();}
    if(game==='word')for(const letter of 'КОД')await page.getByRole('button',{name:`Буква ${letter}`,exact:true}).click();
    if(game==='code'){await page.getByLabel('Твоята комбинация').fill('0123');await page.getByRole('button',{name:'Провери отговора'}).click();}
    if(game==='robot'){await page.getByRole('button',{name:'Команда 2 нагоре'}).click();await page.getByRole('button',{name:'Провери маршрута'}).click();}
    if(game==='memory')for(let i=1;i<=16;i++)await page.getByRole('button',{name:`Карта ${i}: затворена`,exact:true}).click();
    if(game==='hunt'){await page.getByLabel('Твоят отговор').fill('сензор');await page.getByRole('button',{name:'Провери отговора'}).click();}
    await expect(page.getByText('Получаваш +5 точки за своя напредък.')).toBeVisible();
    await expect(page.getByText('5/30 точки',{exact:true})).toBeVisible();
    await page.reload();await dismissCookies(page);await expect(page.getByText('Получаваш +5 точки за своя напредък.')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath(`${game}.png`),fullPage:true});
  });
}

test('a lost response retries the identical request without a second reward',async({page})=>{
  const {actions}=await setup(page,'code',true,true);
  await page.goto('/games/code');await dismissCookies(page);
  await page.getByRole('button',{name:'Дневно предизвикателство',exact:true}).click();
  await page.getByLabel('Твоята комбинация').fill('0123');
  await page.getByRole('button',{name:'Провери отговора'}).click();
  await page.getByRole('button',{name:'Повтори действието'}).click();
  await expect(page.getByText('Получаваш +5 точки за своя напредък.')).toBeVisible();
  expect(actions).toHaveLength(2);expect(actions[0]).toEqual(actions[1]);
});
