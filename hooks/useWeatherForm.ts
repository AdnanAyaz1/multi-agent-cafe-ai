'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { weatherRequestSchema } from '@/lib/validators/weather';

type WeatherFormInput = { city: string };

export interface WeatherFormState {
  city: string;
  setCity: (value: string) => void;
  submit: () => void;
  canSubmit: boolean;
}

export function useWeatherForm(onSubmit: (city: string) => void): WeatherFormState {
  const form = useForm<WeatherFormInput>({
    resolver: zodResolver(weatherRequestSchema),
    defaultValues: { city: '' },
  });

  const city = form.watch('city') ?? '';

  const setCity = (value: string) => {
    form.setValue('city', value);
  };

  const submit = () => {
    const trimmed = city.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return {
    city,
    setCity,
    submit,
    canSubmit: city.trim().length > 0,
  };
}
