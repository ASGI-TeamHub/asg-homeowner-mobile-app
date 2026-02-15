import React from 'react';
import renderer from 'react-test-renderer';
import GenerationGauge from '../../components/GenerationGauge';

describe('GenerationGauge', () => {
  it('renders with zero max power', () => {
    const tree = renderer.create(<GenerationGauge currentPower={0} maxPower={0} todayGeneration={0} />).toJSON();
    expect(tree).toBeTruthy();
  });
});
