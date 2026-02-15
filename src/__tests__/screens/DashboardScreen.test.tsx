import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('../../store', () => ({
  useAppSelector: (fn: (state: { auth: { user: { site_reference: string; first_name: string } } }) => unknown) => fn({ auth: { user: { site_reference: 'S1', first_name: 'Chris' } } }),
}));

jest.mock('../../store/api/luxApi', () => ({
  useGetSiteDataQuery: () => ({ data: { data: null }, isLoading: false, isError: false, isFetching: false, refetch: jest.fn() }),
  useGetLiveGenerationQuery: () => ({ data: { data: null }, isLoading: false, isFetching: false, refetch: jest.fn() }),
  useGetPerformanceAlertsQuery: () => ({ data: { data: [] }, isLoading: false, isFetching: false, isError: false, refetch: jest.fn() }),
}));

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));

import DashboardScreen from '../../screens/Dashboard/DashboardScreen';

describe('DashboardScreen', () => {
  it('renders', () => {
    const tree = renderer.create(<DashboardScreen />).toJSON();
    expect(tree).toBeTruthy();
  });
});
