import adminApiClient from '@/api-clients/admin-api-client';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

const Test = () => {
  useQuery({
    queryKey: ['ss'],
    queryFn: () => adminApiClient.get('/user/ssss'),
  });
  return <div>Test</div>;
};

export default Test;
