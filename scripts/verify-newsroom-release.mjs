// Keep the earlier verification entry point aligned with the current newsroom.
if(process.env.NOBI_NEWS_PREVIEW&&!process.env.NOBI_READER_PREVIEW)process.env.NOBI_READER_PREVIEW=process.env.NOBI_NEWS_PREVIEW;
await import('./verify-news-reader-release.mjs');
