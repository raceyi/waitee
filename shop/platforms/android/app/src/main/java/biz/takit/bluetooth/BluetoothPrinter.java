package biz.takit.bluetooth;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Hashtable;
import java.util.Set;
import java.util.UUID;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.widget.Toast;

import zj.com.command.sdk.PrinterCommand;

public class BluetoothPrinter extends CordovaPlugin {
	private static final String LOG_TAG = "BluetoothPrinter";

	private static final String KOREAN = "EUC-KR";

	// Message types sent from the BluetoothService Handler
	public static final int MESSAGE_STATE_CHANGE = 1;
	public static final int MESSAGE_READ = 2;
	public static final int MESSAGE_WRITE = 3;
	public static final int MESSAGE_DEVICE_NAME = 4;
	public static final int MESSAGE_TOAST = 5;
	public static final int MESSAGE_CONNECTION_LOST = 6;
	public static final int MESSAGE_UNABLE_CONNECT = 7;
	/*******************************************************************************************************/
	private BluetoothService mService = null;

	private String mConnectedDeviceName = null;
	BluetoothDevice mmDevice;

	CallbackContext mCallbackContext=null; // status 변경을 앱에 전달하기 위해 필요하다

	@Override
        public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		Log.e(LOG_TAG, "action:" + action);
		if (action.equals("list")) {
			listBT(callbackContext);
			return true;
		}
		if(action.equals("listen")){
			mCallbackContext=callbackContext;
			return true;
		}

		if (action.equals("connect")) {
			String address = args.getString(0);
			Log.e(LOG_TAG, "connect to " + address); // kalen.lee@takit.biz
			if (findBT(callbackContext, address)) {
				try {
					Log.e(LOG_TAG, "call connectBT"); // kalen.lee@takit.biz
					connectBT(callbackContext);
				} catch (IOException e) {
					Log.e(LOG_TAG, e.getMessage());
					e.printStackTrace();
				}
			} else {
				callbackContext.error("Bluetooth Device Not Found: " + address);
			}
			return true;
		}
		if(action.equals("print")){
			try {
				String msg = args.getString(0);
				printText(callbackContext, msg);
			} catch (IOException e) {
				Log.e(LOG_TAG, e.getMessage());
				e.printStackTrace();
				return false;
			}
			return true;
		}
		return true;
	}

	@SuppressLint("HandlerLeak")
	private final Handler mHandler = new Handler() {
		@Override
		public void handleMessage(Message msg) {
			switch (msg.what) {
				case MESSAGE_STATE_CHANGE:
					Log.i(LOG_TAG, "MESSAGE_STATE_CHANGE: " + msg.arg1);
					switch (msg.arg1) {
						case BluetoothService.STATE_CONNECTED:
							if(mCallbackContext!=null){
								PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, "connected");
								pluginResult.setKeepCallback(true);
								mCallbackContext.sendPluginResult(pluginResult);
							}
							break;
						case BluetoothService.STATE_CONNECTING:
							if(mCallbackContext!=null){
								PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, "connecting");
								pluginResult.setKeepCallback(true);
								mCallbackContext.sendPluginResult(pluginResult);
							}
							break;
						case BluetoothService.STATE_LISTEN:
						case BluetoothService.STATE_NONE:
							break;
					}
					break;
				case MESSAGE_WRITE:

					break;
				case MESSAGE_READ:

					break;
				case MESSAGE_DEVICE_NAME:
					// save the connected device's name
					mConnectedDeviceName = msg.getData().getString(mService.DEVICE_NAME);
					Log.i(LOG_TAG,"Connected to " + mConnectedDeviceName);
					break;
				case MESSAGE_TOAST:
					break;
				case MESSAGE_CONNECTION_LOST:    //蓝牙已断开连接
					Log.i(LOG_TAG,"Device connection was lost ");
					if(mCallbackContext!=null){
						PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, "disconnect");
						pluginResult.setKeepCallback(true);
						mCallbackContext.sendPluginResult(pluginResult);
					}
					break;
				case MESSAGE_UNABLE_CONNECT:     //无法连接设备
					Log.i(LOG_TAG,"Unable to connect device");
					if(mCallbackContext!=null){
						PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, "unable");
						pluginResult.setKeepCallback(true);
						mCallbackContext.sendPluginResult(pluginResult);
					}
					break;
			}
		}
	};

	void listBT(CallbackContext callbackContext) {
		BluetoothAdapter mBluetoothAdapter = null;
		String errMsg = null;
		try {
			mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
			if (mBluetoothAdapter == null) {
				errMsg = "No bluetooth adapter available";
				Log.e(LOG_TAG, errMsg);
				callbackContext.error(errMsg);
				return;
			}
			if (!mBluetoothAdapter.isEnabled()) {
				Intent enableBluetooth = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
				this.cordova.getActivity().startActivityForResult(enableBluetooth, 0);
			}
			Set<BluetoothDevice> pairedDevices = mBluetoothAdapter.getBondedDevices();
			if (pairedDevices.size() > 0) {
				JSONArray json = new JSONArray();
				for (BluetoothDevice device : pairedDevices) {
					Hashtable map = new Hashtable();
					//map.put("type", device.getType()); ???
					map.put("address", device.getAddress());
					map.put("name", device.getName());
					JSONObject jObj = new JSONObject(map);
					json.put(jObj);
				}
				callbackContext.success(json);
			} else {
				callbackContext.error("No Bluetooth Device Found");
			}
		} catch (Exception e) {
			errMsg = e.getMessage();
			Log.e(LOG_TAG, errMsg);
			e.printStackTrace();
			callbackContext.error(errMsg);
		}
	}


	// This will find a bluetooth printer device
	boolean findBT(CallbackContext callbackContext, String address) {
		BluetoothAdapter mBluetoothAdapter = null;
		try {
			mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
			if (mBluetoothAdapter == null) {
				Log.e(LOG_TAG, "No bluetooth adapter available");
			}
			if (!mBluetoothAdapter.isEnabled()) {
				Intent enableBluetooth = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
				this.cordova.getActivity().startActivityForResult(enableBluetooth, 0);
			}
			Set<BluetoothDevice> pairedDevices = mBluetoothAdapter.getBondedDevices();
			if (pairedDevices.size() > 0) {
				for (BluetoothDevice device : pairedDevices) {
					if (device.getAddress().equalsIgnoreCase(address)) {
						mmDevice = device;
						Log.e(LOG_TAG,"mmDevice found:"+mmDevice.getName());// kalen.lee@takit.biz
						return true;
					}
				}
			}
			//Log.d(LOG_TAG, "Bluetooth Device Found: " + mmDevice.getName());
		} catch (Exception e) {
			String errMsg = e.getMessage();
			Log.e(LOG_TAG, errMsg);
			e.printStackTrace();
			callbackContext.error(errMsg);
		}
		return false;
	}

	boolean connectBT(CallbackContext callbackContext) throws IOException {
		if(mService==null)
			mService=new BluetoothService(this.cordova.getActivity(), mHandler);
		mService.connect(mmDevice);
		return true;
	}

	private boolean SendDataByte(byte[] data) {
		if (mService.getState() != BluetoothService.STATE_CONNECTED) {
			return false;
		}
		try {
			mService.write(data);
		}catch(Exception e){
			String errMsg = e.getMessage();
			Log.e(LOG_TAG, errMsg);
			e.printStackTrace();
			return false;
		}
		return true;
	}

	boolean printText(CallbackContext callbackContext,String msg) throws IOException {
		String strs[]=msg.split(",");
		String msgTitle = "\n\n"+strs[0]+"\n\n";
		String data = strs[1]+"\n\n\n\n";//"성공적으로 우리의 휴대용 블루투스 프린터에 연결 한! \n우리는 하이테크 기업 중 하나에서 개발, 생산 및 상업 영수증 프린터와 바코드 스캐닝 장비 판매 전문 회사입니다.\n\n\n\n\n\n\n";

		if(SendDataByte(PrinterCommand.POS_Print_Text(msgTitle, KOREAN, 0, 1, 1, 0)) &&
				SendDataByte(PrinterCommand.POS_Print_Text(data, KOREAN, 0, 1, 1, 0))){
			SendDataByte(PrinterCommand.POS_Set_Cut(1));
			SendDataByte(PrinterCommand.POS_Set_PrtInit());
			callbackContext.success();
		}else{
			callbackContext.error("fail to print out");
		}
		return false;
	}

}

