package com.nobi.racing;
import java.net.URI;
/** Shared pacing for the two fixed historical-data workers: at most two starts per second. */
final class OpenF1History {
    private static long previous=System.nanoTime()-500_000_000L;
    private OpenF1History() {}
    static synchronized byte[] download(URI uri) throws Exception {
        if(!"https".equals(uri.getScheme())||!"api.openf1.org".equals(uri.getHost())||uri.getUserInfo()!=null)throw new IllegalArgumentException("Historical source");
        long wait=500_000_000L-(System.nanoTime()-previous);
        if(wait>0)Thread.sleep((wait+999999L)/1000000L);
        previous=System.nanoTime();return OfficialNews.download(uri,"json");
    }
}
