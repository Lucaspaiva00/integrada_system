package br.com.paivatech.integrada;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(IntegradaPDF.class);
        super.onCreate(savedInstanceState);
    }
}
