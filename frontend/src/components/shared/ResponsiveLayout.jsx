import React from 'react';
import { useDevice } from './DeviceProvider';

const ResponsiveLayout = ({ mobile, tablet, desktop, children }) => {
  const { isMobile, isTablet, isDesktop } = useDevice();

  if (isMobile && mobile) return mobile;
  if (isTablet && tablet) return tablet;
  if (isDesktop && desktop) return desktop;

  return children || null;
};

export default ResponsiveLayout;