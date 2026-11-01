package com.nobi.racing;

import java.net.*;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class LocalNewsTranslation {
    private final ObjectMapper mapper; private final boolean enabled;
    public LocalNewsTranslation(ObjectMapper mapper, @Value("${nobi.news.translation-enabled:false}") boolean enabled) { this.mapper=mapper; this.enabled=enabled; }
    List<LatestNews.Item> apply(List<LatestNews.Item> items) {
        if (!enabled || items.isEmpty()) return items;
        final List<LatestNews.Item> edited = new ArrayList<>();
        try(var input=LocalNewsTranslation.class.getResourceAsStream("/content/news-zh-edited.json")) {
            var corrections=mapper.readTree(input);
            for(var item:items) {
                var correction=corrections.path(Crypto.digest(item.url()+"\n"+item.title()+"\n"+item.summary()));
                if(correction.isMissingNode())edited.add(item);
                else edited.add(new LatestNews.Item(item.title(),item.url(),item.publishedAt(),item.summary(),correction.path("titleZh").asText(),correction.path("summaryZh").asText(),"edited"));
            }
        } catch(Exception invalid) { return items; }
        if(edited.stream().allMatch(item->item.translationStatus().equals("edited")))return List.copyOf(edited);
        var direct = new ProxySelector() {
            public List<Proxy> select(URI uri) { return List.of(Proxy.NO_PROXY); }
            public void connectFailed(URI uri, SocketAddress address, java.io.IOException error) {}
        };
        var client=HttpClient.newBuilder().proxy(direct).connectTimeout(Duration.ofSeconds(2)).build();
        try {
            List<String> texts=new ArrayList<>();
            for(var item:items) { texts.add(item.title()); texts.add(item.summary()); }
            var request=HttpRequest.newBuilder(URI.create("http://127.0.0.1:5291/translate")).timeout(Duration.ofSeconds(60)).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(Map.of("texts",texts)))).build();
            var response=client.sendAsync(request, info -> new OfficialNews.LimitedBody()).orTimeout(65,TimeUnit.SECONDS).join();
            if (response.statusCode()!=200) return List.copyOf(edited);
            var result=mapper.readTree(response.body()).path("translations");
            if (!result.isArray() || result.size()!=texts.size()) return List.copyOf(edited);
            List<LatestNews.Item> translated=new ArrayList<>();
            for(int i=0;i<items.size();i++) {
                if(edited.get(i).translationStatus().equals("edited")){translated.add(edited.get(i));continue;}
                String title=result.get(i*2).asText(), summary=result.get(i*2+1).asText();
                if (!safe(title,600) || !safe(summary,1800) || title.isBlank() || !title.matches("(?s).*[\\p{IsHan}].*")) {translated.add(items.get(i));continue;}
                var item=items.get(i); translated.add(new LatestNews.Item(item.title(),item.url(),item.publishedAt(),item.summary(),title,summary,"machine"));
            }
            return List.copyOf(translated);
        } catch(Exception error) { return List.copyOf(edited); }
        finally { client.shutdownNow(); }
    }
    static boolean safe(String text,int max) { return text.length()<=max && !text.matches("(?s).*[<>\\p{Cntrl}].*"); }
}
