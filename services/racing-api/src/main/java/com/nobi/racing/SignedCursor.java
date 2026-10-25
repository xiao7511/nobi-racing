package com.nobi.racing;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SignedCursor {
    private final byte[] key;
    public SignedCursor(@Value("${nobi.cursor-key}") String configured) {
        if(configured.isEmpty()) { key=new byte[32];new SecureRandom().nextBytes(key); }
        else { if(configured.length()<32) throw new IllegalStateException("Cursor key must contain at least 32 characters"); key=configured.getBytes(StandardCharsets.UTF_8); }
    }
    public String encode(String sort,String binding) {
        String payload=Base64.getUrlEncoder().withoutPadding().encodeToString((sort+"\n"+binding).getBytes(StandardCharsets.UTF_8));
        return payload+"."+Base64.getUrlEncoder().withoutPadding().encodeToString(sign(payload));
    }
    public String decode(String cursor,String binding) {
        try {
            if(cursor.length()>512) throw ApiFailure.validation();
            String[] parts=cursor.split("\\.",-1);if(parts.length!=2 || !MessageDigest.isEqual(sign(parts[0]),Base64.getUrlDecoder().decode(parts[1]))) throw ApiFailure.validation();
            String[] data=new String(Base64.getUrlDecoder().decode(parts[0]),StandardCharsets.UTF_8).split("\n",-1);
            if(data.length!=2) throw ApiFailure.validation();
            if(!data[1].equals(binding)) throw new ApiFailure(409,"SNAPSHOT_CHANGED");
            return data[0];
        } catch(IllegalArgumentException error) { throw ApiFailure.validation(); }
    }
    private byte[] sign(String payload) {
        try { Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(key,"HmacSHA256"));return mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)); }
        catch(java.security.GeneralSecurityException error) { throw new IllegalStateException(error); }
    }
}
