import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

import {
  ALLOWED_RULES,
  FORBIDDEN_RULES,
  RULES_CONSEQUENCES,
  RULES_CONTACT_NOTE,
  RULES_TITLE,
} from '@/content/rules';

const RulesContent: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShieldCheck className="mr-2 h-6 w-6 text-green-500" />
          {RULES_TITLE}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8"> {/* Increased space-y for better separation */}
        <div>
          <h3 className="font-semibold text-xl flex items-center mb-3"> {/* Larger heading */}
            <ShieldCheck className="mr-2 h-6 w-6 text-green-500" />
            Допустимо съдържание и поведение:
          </h3>
          <ul className="list-disc list-inside space-y-3 text-muted-foreground text-base"> {/* Larger text, more space */}
            {ALLOWED_RULES.map((rule) => (
              <li key={rule.title}>
                <strong>{rule.title}:</strong> {rule.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t pt-8 border-gray-200 dark:border-gray-700"> {/* Separator */}
          <h3 className="font-semibold text-xl flex items-center mb-3"> {/* Larger heading */}
            <ShieldAlert className="mr-2 h-6 w-6 text-red-500" />
            Недопустимо и забранено съдържание/поведение:
          </h3>
          <ul className="list-disc list-inside space-y-3 text-muted-foreground text-base"> {/* Larger text, more space */}
            {FORBIDDEN_RULES.map((rule) => (
              <li key={rule.title}>
                <strong>{rule.title}:</strong> {rule.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-6 text-center text-sm text-gray-500 dark:text-gray-400"> {/* Footer text */}
          <p>
            <strong>Последици от нарушения:</strong> {RULES_CONSEQUENCES}
          </p>
          <p className="mt-2">
            {RULES_CONTACT_NOTE}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RulesContent;
