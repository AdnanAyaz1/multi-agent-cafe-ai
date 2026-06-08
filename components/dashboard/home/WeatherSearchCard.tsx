'use client';

import { Search } from 'lucide-react';
import { Card } from '../ui/Card';
import { CardHeading } from '../ui/CardHeading';
import { InputLabel } from '../ui/InputLabel';
import { FormInput } from '../ui/FormInput';
import { SubmitButton } from '../ui/SubmitButton';
import { ErrorAlert } from '../ui/ErrorAlert';
import type { WeatherSearchCardProps } from '@/types/dashboard';

export function WeatherSearchCard({ city, onCityChange, onSearch, loading, error }: WeatherSearchCardProps) {
  return (
    <Card>
      <CardHeading className="mb-4">Search Weather</CardHeading>
      <div className="space-y-4">
        <div>
          <InputLabel>City Name</InputLabel>
          <FormInput
            placeholder="e.g. Seattle, London, Tokyo..."
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        <SubmitButton onClick={onSearch} loading={loading} disabled={!city.trim()}>
          <Search className="size-4" />
          Fetch Weather
        </SubmitButton>
        {error && <ErrorAlert message={error} />}
      </div>
    </Card>
  );
}
