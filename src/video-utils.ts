import type {Slide} from './course-schema';

export const secondsToFrame = (seconds: number, fps: number) => Math.round(seconds * fps);

export const getActiveSlide = (slides: Slide[], frame: number, fps: number): Slide => {
  return (
    slides.find((slide) => frame >= secondsToFrame(slide.start, fps) && frame < secondsToFrame(slide.end, fps)) ??
    slides[slides.length - 1]
  );
};

export const isDocumentSlide = (slide: Slide) => slide.kind === 'document' && Boolean(slide.backgroundImage);

export const normalizeStaticPath = (filePath: string) => filePath.replaceAll('\\', '/').replace(/^public\//, '');

export const getAudioSrc = (slide: Slide) => ('audioSrc' in slide ? slide.audioSrc : undefined);

export const getBackgroundImage = (slide: Slide) => ('backgroundImage' in slide ? slide.backgroundImage : undefined);

export const getBody = (slide: Slide) => ('body' in slide ? slide.body : undefined);

export const getBullets = (slide: Slide) => ('bullets' in slide ? slide.bullets : undefined);

export const getCode = (slide: Slide) => ('code' in slide ? slide.code : undefined);
