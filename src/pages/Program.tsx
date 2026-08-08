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
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Import API function and type
import { getProgramSchedule, getSiteStatus, SiteStatus } from '@/lib/api';

// Import layout components
import FeatureDisabledPage from './FeatureDisabledPage'; // Import the new component
import { ContentSkeleton, QueryErrorState } from '@/components/query/QueryStates';

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
          setSelectedClass(schedule.classes[0] || '');
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
  }, [isProgramEnabled]);

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };

  const filteredData = data.filter(row => row['Клас'] === selectedClass);

  const renderContent = () => {
    // The loading state now only considers the CSV loading.
    if (loadingSchedule) {
      return (
        <div className="py-12 text-center flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground ml-3">Зареждане на програмата...</p>
        </div>
      );
    }
    
    if (scheduleError) {
      return <div className="py-12 text-center text-red-500">Грешка: {scheduleError}</div>;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <span>Програма за : {selectedClass}</span>
            {classes.length > 0 && (
              <Select onValueChange={handleClassChange} value={selectedClass}>
                <SelectTrigger className="w-full md:w-[200px]">
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
        <CardContent>
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
    <div className="w-full bg-background">
      <main>
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-br from-primary/10 via-transparent to-transparent pt-16 pb-12 md:pt-24">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">Учебна програма</h1>
                <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                    Вижте седмичната програма за различните класове.
                </p>
            </div>
        </section>

        {/* Schedule Section */}
        <section className="w-full pb-12">
            <div className="container mx-auto px-4">
                <Separator className="mb-8" />
                {renderContent()}
            </div>
        </section>
      </main>
    </div>
  );
};

export default Program;
