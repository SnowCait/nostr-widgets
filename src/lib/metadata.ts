import { verifyEvent, type Event, type VerifiedEvent } from "nostr-tools/pure";
import { SimplePool } from "nostr-tools/pool";

const relays = [
  "wss://purplepag.es/",
  "wss://user.kindpag.es/",
  "wss://directory.yabu.me/",
];

const pool = new SimplePool();

let connectionsCount = 0;

export function fetchMetadata(pubkey: string, onEvent: (event: Event) => void) {
  connectionsCount++;
  let metadataEvent: VerifiedEvent | undefined;
  const subscription = pool.subscribe(
    relays,
    { kinds: [0], authors: [pubkey] },
    {
      onevent(event: Event): void {
        if (!verifyEvent(event)) {
          return;
        }

        if (metadataEvent && metadataEvent.created_at >= event.created_at) {
          return;
        }

        metadataEvent = event;
        onEvent(event);
      },
      oneose() {
        subscription.close();
        connectionsCount--;
        if (connectionsCount === 0) {
          // setTimeout is wokaround for "WebSocket is already in CLOSING or CLOSED state."
          setTimeout(() => {
            pool.destroy();
          });
        }
      },
    },
  );
}
