/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as attendance from "../attendance.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as emails from "../emails.js";
import type * as events from "../events.js";
import type * as explore from "../explore.js";
import type * as friendships from "../friendships.js";
import type * as lib_embeddings_cosineSimilarity from "../lib/embeddings/cosineSimilarity.js";
import type * as lib_embeddings_generateEventEmbedding from "../lib/embeddings/generateEventEmbedding.js";
import type * as lib_embeddings_generateUserEmbedding from "../lib/embeddings/generateUserEmbedding.js";
import type * as lib_recommendation_deadlineScore from "../lib/recommendation/deadlineScore.js";
import type * as lib_recommendation_explanationGenerator from "../lib/recommendation/explanationGenerator.js";
import type * as lib_recommendation_finalScore from "../lib/recommendation/finalScore.js";
import type * as lib_recommendation_freshnessScore from "../lib/recommendation/freshnessScore.js";
import type * as lib_recommendation_recommendationEngine from "../lib/recommendation/recommendationEngine.js";
import type * as lib_recommendation_semanticScore from "../lib/recommendation/semanticScore.js";
import type * as lib_recommendation_socialScore from "../lib/recommendation/socialScore.js";
import type * as lib_recommendation_trendScore from "../lib/recommendation/trendScore.js";
import type * as notifications from "../notifications.js";
import type * as recommendations from "../recommendations.js";
import type * as registrations from "../registrations.js";
import type * as search from "../search.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  attendance: typeof attendance;
  crons: typeof crons;
  dashboard: typeof dashboard;
  emails: typeof emails;
  events: typeof events;
  explore: typeof explore;
  friendships: typeof friendships;
  "lib/embeddings/cosineSimilarity": typeof lib_embeddings_cosineSimilarity;
  "lib/embeddings/generateEventEmbedding": typeof lib_embeddings_generateEventEmbedding;
  "lib/embeddings/generateUserEmbedding": typeof lib_embeddings_generateUserEmbedding;
  "lib/recommendation/deadlineScore": typeof lib_recommendation_deadlineScore;
  "lib/recommendation/explanationGenerator": typeof lib_recommendation_explanationGenerator;
  "lib/recommendation/finalScore": typeof lib_recommendation_finalScore;
  "lib/recommendation/freshnessScore": typeof lib_recommendation_freshnessScore;
  "lib/recommendation/recommendationEngine": typeof lib_recommendation_recommendationEngine;
  "lib/recommendation/semanticScore": typeof lib_recommendation_semanticScore;
  "lib/recommendation/socialScore": typeof lib_recommendation_socialScore;
  "lib/recommendation/trendScore": typeof lib_recommendation_trendScore;
  notifications: typeof notifications;
  recommendations: typeof recommendations;
  registrations: typeof registrations;
  search: typeof search;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
