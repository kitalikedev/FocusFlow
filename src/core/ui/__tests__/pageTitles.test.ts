import { describe, expect, it } from 'vitest';
import { formatPageTitle, titleForPath } from '../pageTitles';

describe('formatPageTitle', () => {
  it('adds the app name after the page name', () => {
    expect(formatPageTitle('Tracking')).toBe('Tracking · FocusFlow');
  });

  it('gives just the app name when there is no page name', () => {
    expect(formatPageTitle()).toBe('FocusFlow');
    expect(formatPageTitle('')).toBe('FocusFlow');
  });

  it('does not repeat the app name when the page name already has it', () => {
    expect(formatPageTitle('About FocusFlow')).toBe('About FocusFlow');
  });
});

describe('titleForPath', () => {
  it.each([
    [['themes'], 'Themes · FocusFlow'],
    [['analytics'], 'Focus Analytics · FocusFlow'],
    [['tracking'], 'Tracking · FocusFlow'],
    [['about'], 'About FocusFlow'],
    [['app'], 'Workspace · FocusFlow'],
  ])('gives the page title for %j', (segments, expected) => {
    expect(titleForPath(segments)).toBe(expected);
  });

  it('gives the plain app name for the home page and the root path', () => {
    expect(titleForPath(undefined)).toBe('FocusFlow');
    expect(titleForPath([])).toBe('FocusFlow');
    expect(titleForPath([''])).toBe('FocusFlow');
  });

  it('gives the plain app name for an unknown path', () => {
    expect(titleForPath(['khong-ton-tai'])).toBe('FocusFlow');
  });

  it('uses only the first path segment', () => {
    expect(titleForPath(['themes', 'extra'])).toBe('Themes · FocusFlow');
  });
});
