/**
 * @module
 * 
 * A basic helper for CRDT delta-synchronization between two peers. In this process
 * Peer 1 initiates the synchronization, then Peer 2 replies, and finally Peer 1
 * finishes with a final message: 3 messages in total.
 * 
 * - Message 1: Peer 1 initiates request, sends its *causal context* (version vector).
 * - Message 2: Peer 2 replies with a delta, which also contains Peer 2's causal context.
 * - Message 3: Peer 1 applies the delta, computes a delta to send back to Peer 2, and sends it.
 * 
 * After this process, both peers should have the same state, and their clocks should
 * cover each other.
 * 
 * ## Example
 * 
 * The first code block below shows the flow on Peer 1, the one who initiates
 * the synchronization.
 * 
 * ```ts
 * const message2 = await peer1Initiate(model, async (message1) => {
 *   // send message1 to peer 2 and wait for reply (message2)
 * });
 *
 * await peer1Finalize(model, message2, async (message3) => {
 *   // send message3 to peer 2
 * });
 * ```
 * 
 * Now, peer 2, who participates in the synchronization:
 * 
 * ```ts
 * const message3 = await peer2Reply(model, message1, async (message2) => {
 *   // send message2 to peer 1 and wait for reply (message3)
 * });
 * 
 * peer2Finalize(model, message3); 
 * ```
 */

import {Delta} from "./Delta";
import {ClockVector} from "../../json-crdt-patch";
import type {Model} from "../model";

/**
 * Initiates the synchronization process by sending Peer 1's causal context: Message 1.
 * @param peer1Model Model of Peer 1.
 * @param send Function that sends the message over the network.
 */
export const peer1Initiate = async (
  peer1Model: Model<any>,
  send: (message1: Uint8Array) => Promise<Uint8Array>,
): Promise<Uint8Array> =>
  await send(peer1Model.clock.toU8());

export const peer2Reply = async (
  peer2Model: Model<any>,
  message1: Uint8Array,
  send: (message2: Uint8Array) => Promise<Uint8Array>,
): Promise<Uint8Array> => 
  await send(peer2Model.delta(ClockVector.fromU8(message1)).toU8());

export const peer1Finalize = async (
  peer1Model: Model<any>,
  message2: Uint8Array,
  send: (message3: Uint8Array) => Promise<void>,
): Promise<void> => {
  const incomingDelta = Delta.from(message2);
  const outgoingDelta = peer1Model.delta(incomingDelta.vv1);
  peer1Model.applyDelta(incomingDelta);
  await send(outgoingDelta.toU8());
};

export const peer2Finalize = (
  peer2Model: Model<any>,
  message3: Uint8Array,
) => peer2Model.applyDelta(Delta.from(message3));
