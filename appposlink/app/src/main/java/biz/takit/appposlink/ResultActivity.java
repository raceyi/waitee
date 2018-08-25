package biz.takit.appposlink;

import android.content.Intent;
import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

public class ResultActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_result);

        if(getIntent()!=null) {
                Log.d("ResultActivity...", "getIntent()!=null");
                Intent result_intent = new Intent(ResultActivity.this, MainActivity.class);
                result_intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP |  Intent.FLAG_ACTIVITY_SINGLE_TOP);

                Uri uri = getIntent().getData();
                Log.d("parseIntent",getIntent().getData().toString());

                result_intent.putExtra("result",getIntent().getData().toString());
                startActivity(result_intent);
                finish();
            }
    }



}
