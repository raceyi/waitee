package biz.takit.appposlink;

import android.content.Intent;
import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

public class MainActivity extends AppCompatActivity {
    String price = null;
    String businessNumber = null;
    String catid=null;
    String type=null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        if(getIntent()!=null) {  //kalen's test
            Log.d("MainActivity...", "getIntent()!=null");

            Uri uri = getIntent().getData();

            Log.d("parseIntent", getIntent().getData().toString());

            if (uri != null) {
                price = uri.getQueryParameter("price");
                businessNumber = uri.getQueryParameter("businessNumber");
                catid = uri.getQueryParameter("catid");
                type=uri.getQueryParameter("type");
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.addCategory(Intent.CATEGORY_DEFAULT);
                intent.addCategory(Intent.CATEGORY_BROWSABLE);
                String param=null;
                Log.d("type:", type);
                if(type.equals("payment")){
                    param = "apppos://pay?gubun=0100&price=" + price
                            + "&bizno=" + businessNumber
                            + "&catid=" + catid
                            + "&intMon=00&finishActivity=true"
                            + "&returnURI="
                            + "appposlink:"
                            + "/" + "/result";
                }else if(type.equals("cancel")){
                    String approvalNum=uri.getQueryParameter("approvalNum");
                    String approvalDate=uri.getQueryParameter("approvalDate");
                    param = "apppos://pay?gubun=0400&price=" + price
                            + "&bizno=" + businessNumber
                            + "&catid=" + catid
                            + "&appNo=" + approvalNum
                            + "&appDt=" +approvalDate
                            + "&finishActivity=true"
                            + "&returnURI="
                            + "appposlink:"
                            + "/" + "/result";
                }
                Log.d("param:", param);
                intent.setData(Uri.parse(param));
                startActivity(intent);
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        Log.d("TEST","intent returns from resultAcitivity");

        /* 결과 전송 api */
        Intent Resultintent = new Intent();
        intent.putExtra("result", intent.getStringExtra("result"));
        setResult(RESULT_OK, intent);
        finish();
    }

}
