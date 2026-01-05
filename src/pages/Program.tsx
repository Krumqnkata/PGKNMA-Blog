import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
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
import { getSiteStatus, SiteStatus } from '@/lib/api';

// Import layout components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import FeatureDisabledPage from './FeatureDisabledPage'; // Import the new component

// Define the structure of a schedule row
interface ScheduleRow {
  [key: string]: string;
}

const Program: React.FC = () => {
  const { data: siteStatus, isLoading: isStatusLoading, isError: isStatusError } = useQuery<SiteStatus>({
    queryKey: ['siteStatus'],
    queryFn: getSiteStatus,
  });

  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<ScheduleRow[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loadingCsv, setLoadingCsv] = useState<boolean>(true);
  const [errorCsv, setErrorCsv] = useState<string | null>(null);

  const isProgramEnabled = siteStatus?.enable_program_page;

  useEffect(() => {
    // Only fetch CSV data if the feature is enabled
    if (isProgramEnabled === true) {
      const fetchData = async () => {
        try {
          setLoadingCsv(true);
          setErrorCsv(null);
          const response = await fetch('/program.csv');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const csvText = await response.text();

          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const parsedData = results.data as ScheduleRow[];
              if (results.errors.length > 0) {
                   setErrorCsv(`Грешка при парсиране на CSV: ${results.errors.map(e => e.message).join(', ')}`);
              } else if (parsedData.length > 0) {
                const tableHeaders = Object.keys(parsedData[0]).filter(h => h !== 'Клас');
                setHeaders(tableHeaders);
                setData(parsedData);
                const uniqueClasses = [...new Set(parsedData.map(row => row['Клас']).filter(Boolean))];
                setClasses(uniqueClasses);
                if (uniqueClasses.length > 0) {
                  setSelectedClass(uniqueClasses[0]);
                }
              }
              setLoadingCsv(false);
            },
            error: (err) => {
              setErrorCsv(`Грешка при парсиране на CSV: ${err.message}`);
              setLoadingCsv(false);
            }
          });
        } catch (e) {
          if (e instanceof Error) {
              setErrorCsv(`Неуспешно зареждане на файла program.csv: ${e.message}`);
          } else {
              setErrorCsv("Възникна неизвестна грешка при зареждане на данните.");
          }
          setLoadingCsv(false);
        }
      };

      fetchData();
    } else if (isProgramEnabled === false) {
      // If the program is disabled, we don't need to load the CSV.
      setLoadingCsv(false);
    }
  }, [isProgramEnabled]);

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };

  const filteredData = data.filter(row => row['Клас'] === selectedClass);

  const renderContent = () => {
    // The loading state now only considers the CSV loading.
    if (loadingCsv) {
      return (
        <div className="py-12 text-center flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground ml-3">Зареждане на програмата...</p>
        </div>
      );
    }
    
    if (errorCsv) {
      return <div className="py-12 text-center text-red-500">Грешка: {errorCsv}</div>;
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
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (isStatusError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className='text-2xl font-bold text-red-500'>Грешка при зареждане на настройките на страницата</h1>
            <p className='text-muted-foreground'>Моля, опитайте по-късно.</p>
        </div>
      )
  }

  if (isProgramEnabled === false) {
    return <FeatureDisabledPage />;
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
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
      <Footer />
      <BackToTop />
      <CookieConsent />
    </div>
  );
};

export default Program;