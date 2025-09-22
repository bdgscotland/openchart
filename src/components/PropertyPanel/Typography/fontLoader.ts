// Font loading utilities for Google Fonts and custom web fonts

interface FontLoadOptions {
  family: string;
  weights?: string[];
  styles?: string[];
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

interface LoadedFont {
  family: string;
  status: 'loading' | 'loaded' | 'error';
  variants: string[];
}

class FontLoader {
  private static instance: FontLoader;
  private loadedFonts = new Map<string, LoadedFont>();
  private loadingPromises = new Map<string, Promise<void>>();
  private googleFontsLink: HTMLLinkElement | null = null;

  static getInstance(): FontLoader {
    if (!FontLoader.instance) {
      FontLoader.instance = new FontLoader();
    }
    return FontLoader.instance;
  }

  private constructor() {
    this.initializeGoogleFontsLink();
  }

  private initializeGoogleFontsLink(): void {
    // Check if Google Fonts link already exists
    const existingLink = document.querySelector('link[data-font-loader="google-fonts"]');
    if (existingLink) {
      this.googleFontsLink = existingLink as HTMLLinkElement;
    } else {
      // Create new Google Fonts link
      this.googleFontsLink = document.createElement('link');
      this.googleFontsLink.rel = 'stylesheet';
      this.googleFontsLink.setAttribute('data-font-loader', 'google-fonts');
      document.head.appendChild(this.googleFontsLink);
    }
  }

  /**
   * Load a Google Font
   */
  async loadGoogleFont(options: FontLoadOptions): Promise<void> {
    const { family, weights = ['400'], styles = ['normal'], display = 'swap' } = options;
    const fontKey = this.getFontKey(family, weights, styles);

    // Return existing promise if already loading
    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey);
    }

    // Return immediately if already loaded
    if (this.loadedFonts.get(fontKey)?.status === 'loaded') {
      return Promise.resolve();
    }

    const loadPromise = this.performGoogleFontLoad(family, weights, styles, display);
    this.loadingPromises.set(fontKey, loadPromise);

    try {
      await loadPromise;
      this.loadedFonts.set(fontKey, {
        family,
        status: 'loaded',
        variants: this.generateVariants(weights, styles)
      });
    } catch (error) {
      this.loadedFonts.set(fontKey, {
        family,
        status: 'error',
        variants: []
      });
      throw error;
    } finally {
      this.loadingPromises.delete(fontKey);
    }
  }

  private async performGoogleFontLoad(
    family: string,
    weights: string[],
    styles: string[],
    display: string
  ): Promise<void> {
    // Update Google Fonts link href
    const currentFonts = this.getCurrentGoogleFontsFromLink();
    const newFontSpec = this.buildGoogleFontSpec(family, weights, styles);

    if (!currentFonts.includes(family)) {
      const updatedHref = this.buildGoogleFontsUrl([...currentFonts, newFontSpec], display);

      if (this.googleFontsLink) {
        this.googleFontsLink.href = updatedHref;
      }
    }

    // Use Font Loading API if available
    if ('fonts' in document) {
      const fontPromises = weights.flatMap(weight =>
        styles.map(style => {
          const fontFace = new FontFace(family, `url(https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=${display})`, {
            weight,
            style
          });
          return fontFace.load();
        })
      );

      await Promise.all(fontPromises);
    } else {
      // Fallback: wait for font to be available
      await this.waitForFontLoad(family);
    }
  }

  private getCurrentGoogleFontsFromLink(): string[] {
    if (!this.googleFontsLink?.href) return [];

    try {
      const url = new URL(this.googleFontsLink.href);
      const familyParam = url.searchParams.get('family');
      if (!familyParam) return [];

      return familyParam.split('|').map(f => f.split(':')[0]);
    } catch {
      return [];
    }
  }

  private buildGoogleFontSpec(family: string, weights: string[], styles: string[]): string {
    const variants = this.generateVariants(weights, styles);
    if (variants.length === 1 && variants[0] === '400') {
      return family;
    }
    return `${family}:wght@${variants.join(';')}`;
  }

  private generateVariants(weights: string[], styles: string[]): string[] {
    const variants: string[] = [];

    for (const weight of weights) {
      for (const style of styles) {
        if (style === 'normal') {
          variants.push(weight);
        } else if (style === 'italic') {
          variants.push(`${weight}i`);
        }
      }
    }

    return variants.length > 0 ? variants : ['400'];
  }

  private buildGoogleFontsUrl(fontSpecs: string[], display: string): string {
    const baseUrl = 'https://fonts.googleapis.com/css2';
    const familyParam = fontSpecs.join('|');
    return `${baseUrl}?family=${encodeURIComponent(familyParam)}&display=${display}`;
  }

  private async waitForFontLoad(family: string, timeout = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
      const testElement = document.createElement('div');
      testElement.style.fontFamily = `"${family}", monospace`;
      testElement.style.fontSize = '100px';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.top = '-9999px';
      testElement.textContent = 'mmmmmmmmmmlli';

      document.body.appendChild(testElement);

      const initialWidth = testElement.offsetWidth;
      const startTime = Date.now();

      const checkFont = () => {
        const currentWidth = testElement.offsetWidth;
        const elapsed = Date.now() - startTime;

        if (currentWidth !== initialWidth) {
          document.body.removeChild(testElement);
          resolve();
        } else if (elapsed > timeout) {
          document.body.removeChild(testElement);
          reject(new Error(`Font load timeout: ${family}`));
        } else {
          requestAnimationFrame(checkFont);
        }
      };

      requestAnimationFrame(checkFont);
    });
  }

  /**
   * Load a custom web font from URL
   */
  async loadCustomFont(name: string, url: string, options: Partial<FontLoadOptions> = {}): Promise<void> {
    const { weights = ['400'], styles = ['normal'] } = options;
    const fontKey = this.getFontKey(name, weights, styles);

    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey);
    }

    if (this.loadedFonts.get(fontKey)?.status === 'loaded') {
      return Promise.resolve();
    }

    const loadPromise = this.performCustomFontLoad(name, url, weights, styles);
    this.loadingPromises.set(fontKey, loadPromise);

    try {
      await loadPromise;
      this.loadedFonts.set(fontKey, {
        family: name,
        status: 'loaded',
        variants: this.generateVariants(weights, styles)
      });
    } catch (error) {
      this.loadedFonts.set(fontKey, {
        family: name,
        status: 'error',
        variants: []
      });
      throw error;
    } finally {
      this.loadingPromises.delete(fontKey);
    }
  }

  private async performCustomFontLoad(
    name: string,
    url: string,
    weights: string[],
    styles: string[]
  ): Promise<void> {
    if ('fonts' in document) {
      const fontPromises = weights.flatMap(weight =>
        styles.map(style => {
          const fontFace = new FontFace(name, `url(${url})`, {
            weight,
            style
          });
          document.fonts.add(fontFace);
          return fontFace.load();
        })
      );

      await Promise.all(fontPromises);
    } else {
      // Fallback: create CSS @font-face rule
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        @font-face {
          font-family: "${name}";
          src: url("${url}");
          font-display: swap;
        }
      `;
      document.head.appendChild(styleEl);
      await this.waitForFontLoad(name);
    }
  }

  private getFontKey(family: string, weights: string[], styles: string[]): string {
    return `${family}-${weights.join(',')}-${styles.join(',')}`;
  }

  /**
   * Check if a font is loaded
   */
  isFontLoaded(family: string): boolean {
    const loadedFont = Array.from(this.loadedFonts.values()).find(f => f.family === family);
    return loadedFont?.status === 'loaded';
  }

  /**
   * Get loading status of a font
   */
  getFontStatus(family: string): 'loading' | 'loaded' | 'error' | 'not-found' {
    const loadedFont = Array.from(this.loadedFonts.values()).find(f => f.family === family);
    return loadedFont?.status || 'not-found';
  }

  /**
   * Get all loaded fonts
   */
  getLoadedFonts(): LoadedFont[] {
    return Array.from(this.loadedFonts.values()).filter(f => f.status === 'loaded');
  }

  /**
   * Preload commonly used fonts
   */
  async preloadCommonFonts(): Promise<void> {
    const commonFonts = [
      { family: 'Open Sans', weights: ['400', '600', '700'] },
      { family: 'Roboto', weights: ['400', '500', '700'] },
      { family: 'Lato', weights: ['400', '700'] },
      { family: 'Montserrat', weights: ['400', '600', '700'] }
    ];

    const loadPromises = commonFonts.map(font =>
      this.loadGoogleFont(font).catch(err =>
        console.warn(`Failed to preload font ${font.family}:`, err)
      )
    );

    await Promise.allSettled(loadPromises);
  }
}

// Export singleton instance
export const fontLoader = FontLoader.getInstance();

// Utility functions
export const loadGoogleFont = (options: FontLoadOptions) => fontLoader.loadGoogleFont(options);
export const loadCustomFont = (name: string, url: string, options?: Partial<FontLoadOptions>) =>
  fontLoader.loadCustomFont(name, url, options);
export const isFontLoaded = (family: string) => fontLoader.isFontLoaded(family);
export const getFontStatus = (family: string) => fontLoader.getFontStatus(family);
export const preloadCommonFonts = () => fontLoader.preloadCommonFonts();