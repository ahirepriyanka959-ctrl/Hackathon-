import { Dimensions, Platform } from 'react-native';

export function useResponsive() {
  const { width } = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  return {
    isWeb,
    isTablet,
    isDesktop,
    isMobile: !isTablet,
    width,
    // Content max-width for desktop centering
    contentWidth: isDesktop ? 960 : isTablet ? 720 : width,
    // Column count for grid layouts
    columns: isDesktop ? 4 : isTablet ? 3 : 2,
  };
}
