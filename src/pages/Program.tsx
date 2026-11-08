import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import API function and type
import { getProgramSchedule, getSiteStatus, SiteStatus } from '@/lib/api';

// Import layout components
import FeatureDisabledPage from './FeatureDisabledPage'; // Import the new component
import { ContentSkeleton, QueryErrorState } from '@/components/query/QueryStates';
import { InteriorPage, InteriorPageHero, InteriorSection } from '@/components/InteriorPage';

// Define the structure of a schedule row
interface ScheduleRow {
  [key: string]: string;
}

const Program: React.FC = () => {
  const { data: siteStatus, isLoading: isStatusLoading, isError: isStatusError, error: statusError, refetch: refetchStatus } = useQuery<SiteStatus>({
    queryKey: ['siteStatus'],
    queryFn: getSiteStatus,
  });

  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<ScheduleRow[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isProgramEnabled = siteStatus?.enable_program_page;

  useEffect(() => {
    // The schedule is imported through Django admin and delivered by the API.
    if (isProgramEnabled === true) {
      const fetchData = async () => {
        try {
          setLoadingSchedule(true);
          setScheduleError(null);
          const schedule = await getProgramSchedule();
          setHeaders(schedule.headers);
          setData(schedule.rows);
          setClasses(schedule.classes);
          const savedClass = window.localStorage.getItem('preferredProgramClass');
          setSelectedClass(savedClass && schedule.classes.includes(savedClass) ? savedClass : schedule.classes[0] || '');
        } catch (error: unknown) {
          setScheduleError(
            error instanceof Error ? error.message : 'Не може да се зареди учебната програма.'
          );
        } finally {
          setLoadingSchedule(false);
        }
      };

      fetchData();
    } else if (isProgramEnabled === false) {
      // If the program is disabled, we don't need to load the CSV.
      setLoadingSchedule(false);
    }
  }, [isProgramEnabled, retryCount]);

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    window.localStorage.setItem('preferredProgramClass', value);
  };

  const filteredData = data.filter(row => row['Клас'] === selectedClass);

  const renderContent = () => {
    // The loading state now only considers the CSV loading.
    if (loadingSchedule) {
      return (
        <ContentSkeleton variant="detail" label="Зареждане на програмата" />
      );
    }
    
    if (scheduleError) {
      return <QueryErrorState title="Програмата не може да се зареди" message={scheduleError} onRetry={() => setRetryCount((count) => count + 1)} />;
    }

    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <span>Програма за <span className="text-primary">{selectedClass}</span></span>
            {classes.length > 0 && (
              <Select onValueChange={handleClassChange} value={selectedClass}>
                <SelectTrigger aria-label="Изберете клас" className="w-full md:w-[200px]">
                  <SelectValue placeholder="Избери клас" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 sm:pt-6">
          <p className="mb-3 text-sm text-muted-foreground sm:hidden">Плъзнете таблицата настрани, за да видите всички часове.</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header) => (
                    <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headers.map((header) => (
                        <TableCell key={header}>{row[header]}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={headers.length} className="text-center h-24">
                      Няма налични данни за избрания клас.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };
    // Top-level rendering logic based on site status
  if (isStatusLoading) {
    return (
        <main className="container min-h-[60vh] py-16"><ContentSkeleton variant="detail" label="Зареждане на настройките на програмата" /></main>
    );
  }

  if (isStatusError) {
      return (
        <main className="container min-h-[60vh] py-16"><QueryErrorState title="Настройките на програмата не могат да се заредят" message={statusError instanceof Error ? statusError.message : undefined} onRetry={() => void refetchStatus()} /></main>
      )
  }

  if (isProgramEnabled === false) {
    return <FeatureDisabledPage />;
  }

  return (
    <InteriorPage>
      <InteriorPageHero eyebrow="Организирай учебната седмица" title={<>Учебна <span className="text-primary">програма</span></>} description="Изберете клас и проверете часовете в ясен, удобен за мобилни устройства формат." art="schedule" />
      <InteriorSection>{renderContent()}</InteriorSection>
    </InteriorPage>
  );
};

export default Program;
