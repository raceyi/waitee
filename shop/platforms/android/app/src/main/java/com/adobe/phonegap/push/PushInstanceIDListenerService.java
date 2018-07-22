package com.adobe.phonegap.push;

import android.content.Intent;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.FirebaseInstanceIdService;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

public class PushInstanceIDListenerService extends FirebaseInstanceIdService implements PushConstants {
    public static final String LOG_TAG = "Push_InsIdService";

    @Override
    public void onTokenRefresh() {
        // Get updated InstanceID token.
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();
        Log.d(LOG_TAG, "Refreshed token: " + refreshedToken);
        // TODO: Implement this method to send any registration to your app's servers.
        JSONObject json=null;
        try {
            json = new JSONObject().put(REGISTRATION_ID, refreshedToken);
        }catch( JSONException e){
            Log.v(LOG_TAG," regitrationID refresh");
        }
        Log.v(LOG_TAG, "onRegistered: " + json.toString());
        PushPlugin.sendEvent(json);
        //sendRegistrationToServer(refreshedToken);
    }
}
