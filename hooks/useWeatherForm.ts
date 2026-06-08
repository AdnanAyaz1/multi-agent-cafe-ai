'use client';

import { useState } from 'react';

export interface WeatherFormState {
  city: string;
  setCity: (value: string) => void;
  submit: () => void;
  canSubmit: boolean;
}

export function useWeatherForm(onSubmit: (city: string) => void): WeatherFormState {
  const [city, setCity] = useState('');

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
