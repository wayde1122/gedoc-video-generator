import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Slide} from './course-schema';
import type {Theme} from './themes';
import {getBody, getBullets, secondsToFrame} from './video-utils';

type Styles = Record<string, React.CSSProperties>;

type NewsroomPrimitiveProps = {
  styles: Styles;
};

type NewsroomSlideProps = {
  slide: Slide;
  theme: Theme;
  styles: Styles;
};

const pad2 = (value: number) => String(value).padStart(2, '0');

export const NewsroomRule = ({styles}: NewsroomPrimitiveProps) => <span style={styles.newsroomRule} />;

export const NewsroomMasthead = ({theme, styles}: {theme: Theme; styles: Styles}) => (
  <header style={styles.newsroomMasthead}>
    <span style={styles.newsroomMastheadName}>{theme.nameZh}</span>
    <NewsroomRule styles={styles} />
    <span style={styles.newsroomMastheadIssue}>{theme.label}</span>
  </header>
);

export const NewsroomScene = ({
  slide,
  theme,
  styles,
  children,
}: NewsroomSlideProps & {children: React.ReactNode}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slideFrame = frame - secondsToFrame(slide.start, fps);
  const entrance = spring({frame: slideFrame, fps, config: {damping: 22, stiffness: 90}});
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const y = interpolate(entrance, [0, 1], [24, 0]);

  return (
    <section style={{...styles.newsroomScene, opacity, transform: `translateY(${y}px)`}}>
      <NewsroomMasthead theme={theme} styles={styles} />
      {children}
    </section>
  );
};

export const NewsroomHeroHeadline = ({slide, styles}: {slide: Slide; styles: Styles}) => {
  const body = getBody(slide);

  return (
    <div style={styles.newsroomHeroLayout}>
      <main>
        <h1 style={styles.newsroomHeroTitle}>{slide.heading}</h1>
        {body ? <p style={styles.newsroomStandfirst}>{body}</p> : null}
      </main>
      <aside style={styles.newsroomBrief}>
        <div style={styles.newsroomLabel}>Lead Story</div>
        <p style={styles.newsroomBriefText}>{slide.caption}</p>
      </aside>
    </div>
  );
};

export const NewsroomStoryList = ({slide, styles}: {slide: Slide; styles: Styles}) => {
  const bullets = getBullets(slide) ?? [];

  return (
    <div style={styles.newsroomTwoColumn}>
      <section>
        <h1 style={styles.newsroomSectionTitle}>{slide.heading}</h1>
        <p style={styles.newsroomLead}>{slide.caption}</p>
      </section>
      <section style={styles.newsroomList}>
        {bullets.map((bullet, index) => (
          <article key={`${index}-${bullet}`} style={styles.newsroomListItem}>
            <span style={styles.newsroomListIndex}>{pad2(index + 1)}</span>
            <span style={styles.newsroomListText}>{bullet}</span>
          </article>
        ))}
      </section>
    </div>
  );
};

export const NewsroomPullQuote = ({slide, styles}: {slide: Slide; styles: Styles}) => {
  const body = getBody(slide);

  return (
    <div style={styles.newsroomQuoteLayout}>
      <main>
        <blockquote style={styles.newsroomPullQuote}>{slide.heading}</blockquote>
        {body ? <p style={styles.newsroomArticleColumns}>{body}</p> : null}
      </main>
      <aside style={styles.newsroomBrief}>
        <div style={styles.newsroomLabel}>Analysis</div>
        <p style={styles.newsroomBriefText}>{slide.caption}</p>
      </aside>
    </div>
  );
};

export const NewsroomSummaryGrid = ({slide, styles}: {slide: Slide; styles: Styles}) => {
  const bullets = getBullets(slide) ?? [];

  return (
    <>
      <h1 style={styles.newsroomSectionTitle}>{slide.heading}</h1>
      <div style={styles.newsroomSummaryGrid}>
        {bullets.map((bullet, index) => (
          <article key={`${index}-${bullet}`} style={styles.newsroomSummaryCard}>
            <div style={styles.newsroomSummaryNum}>{pad2(index + 1)}</div>
            <div style={styles.newsroomSummaryText}>{bullet}</div>
          </article>
        ))}
      </div>
      <p style={styles.newsroomCaptionInline}>{slide.caption}</p>
    </>
  );
};

export const NewsroomSlideView = ({slide, theme, styles}: NewsroomSlideProps) => {
  if (slide.kind === 'title') {
    return (
      <NewsroomScene slide={slide} theme={theme} styles={styles}>
        <NewsroomHeroHeadline slide={slide} styles={styles} />
      </NewsroomScene>
    );
  }

  if (slide.kind === 'bullets') {
    return (
      <NewsroomScene slide={slide} theme={theme} styles={styles}>
        <NewsroomStoryList slide={slide} styles={styles} />
      </NewsroomScene>
    );
  }

  if (slide.kind === 'summary') {
    return (
      <NewsroomScene slide={slide} theme={theme} styles={styles}>
        <NewsroomSummaryGrid slide={slide} styles={styles} />
      </NewsroomScene>
    );
  }

  return (
    <NewsroomScene slide={slide} theme={theme} styles={styles}>
      <NewsroomPullQuote slide={slide} styles={styles} />
    </NewsroomScene>
  );
};
