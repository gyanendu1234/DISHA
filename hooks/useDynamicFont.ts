import { useAppStore } from '@/store/useAppStore';
import { FontSize } from '@/constants/theme';

export function useDynamicFont() {
  const fontScale = useAppStore(s => s.fontScale);
  return {
    xs:   Math.round(FontSize.xs   * fontScale),
    sm:   Math.round(FontSize.sm   * fontScale),
    base: Math.round(FontSize.base * fontScale),
    md:   Math.round(FontSize.md   * fontScale),
    lg:   Math.round(FontSize.lg   * fontScale),
    xl:   Math.round(FontSize.xl   * fontScale),
    xxl:  Math.round(FontSize.xxl  * fontScale),
    hero: Math.round(FontSize.hero * fontScale),
  };
}
