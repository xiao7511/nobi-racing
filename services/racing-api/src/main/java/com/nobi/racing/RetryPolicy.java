package com.nobi.racing;

import java.time.Duration;
import java.util.function.Supplier;
import java.util.function.Consumer;
import java.util.concurrent.ThreadLocalRandom;

public final class RetryPolicy {
    private RetryPolicy() {}
    public static <T> T execute(int maxAttempts,long delayMillis,Runnable beforeAttempt,Supplier<T> fetch,Consumer<Duration> sleep) {
        for(int attempt=1;;attempt++) {
            beforeAttempt.run();
            try { return fetch.get(); }
            catch(SourceAdapter.Failure error) {
                if(attempt>=maxAttempts || (error.status!=429 && error.status<500)) throw new ApiFailure(503,"SOURCE_UNAVAILABLE");
                long wait=Math.min(10000,Math.max(error.retryAfterMillis,delayMillis*(1L<<Math.min(attempt-1,6)))+ThreadLocalRandom.current().nextLong(25));
                sleep.accept(Duration.ofMillis(wait));
            }
        }
    }
}
