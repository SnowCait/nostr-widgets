import twitter from "twitter-text";

export type BaseToken = {
  readonly type: "text" | "hashtag" | "url" | "reference";
  readonly value: string;
  readonly start: number;
  readonly end: number;
};

export type EmojiToken = {
  readonly type: "emoji";
  readonly value: string;
  readonly start: number;
  readonly end: number;
  readonly url: string;
};

export type Token = BaseToken | EmojiToken;

export function parseContent(content: string, tags: string[][]): Token[] {
  if (!content) {
    return [];
  }

  const urls = twitter.extractUrlsWithIndices(content, {
    extractUrlsWithoutProtocol: false,
  });

  const references = content.matchAll(
    /nostr:((note|npub|nevent|nprofile|naddr)1[023456789acdefghjklmnpqrstuvwxyz]{6,})/g,
  );

  const emojiTags = tags
    .filter(
      ([tagName, shortcode, url]) =>
        tagName === "emoji" &&
        shortcode &&
        /^[0-9a-zA-Z_]+$/.test(shortcode) &&
        url &&
        URL.canParse(url),
    )
    .reduce<string[][]>((reducedTags, tag) => {
      const [, shortcode] = tag;
      if (!reducedTags.some(([, s]) => s === shortcode)) {
        reducedTags.push(tag);
      }
      return reducedTags;
    }, []);

  const hashtags = [
    ...new Set(
      tags
        .filter(([tagName, hashtag]) => tagName === "t" && hashtag)
        .map(([, hashtag]) => hashtag),
    ),
  ];

  const foundTokens = [
    ...urls.map(
      ({ url, indices }): Token => ({
        type: "url",
        value: url,
        start: indices[0],
        end: indices[1],
      }),
    ),
    ...[...references].map(
      (match): Token => ({
        type: "reference",
        value: match[1],
        start: match.index,
        end: match.index + match[0].length,
      }),
    ),
    ...hashtags.flatMap((hashtag): Token[] => {
      const tokens: Token[] = [];
      let position = 0;
      while (true) {
        const start = content
          .toLowerCase()
          .indexOf(`#${hashtag.toLowerCase()}`, position);
        if (start < 0) {
          break;
        }
        const end = start + `#${hashtag}`.length;
        tokens.push({
          type: "hashtag",
          value: content.slice(start + "#".length, end),
          start,
          end,
        });
        position = end;
      }
      return tokens;
    }),
    ...emojiTags.flatMap(([, shortcode, url]): EmojiToken[] => {
      const tokens: EmojiToken[] = [];
      let position = 0;
      while (true) {
        const start = content.indexOf(`:${shortcode}:`, position);
        if (start < 0) {
          break;
        }
        const end = start + `:${shortcode}:`.length;
        tokens.push({
          type: "emoji",
          value: shortcode,
          url,
          start,
          end,
        });
        position = end;
      }
      return tokens;
    }),
  ];

  let index = 0;
  const tokens: Token[] = [];
  for (const token of foundTokens.sort((x, y) => x.start - y.start)) {
    if (token.end < index) {
      continue;
    }

    if (token.start > index) {
      tokens.push({
        type: "text",
        value: content.slice(index, token.start),
        start: index,
        end: token.start,
      });
    }

    tokens.push(token);

    index = token.end;
  }

  if (index < content.length) {
    tokens.push({
      type: "text",
      value: content.slice(index),
      start: index,
      end: content.length,
    });
  }

  return tokens;
}
