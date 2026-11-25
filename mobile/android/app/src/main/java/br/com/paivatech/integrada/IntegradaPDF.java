package br.com.paivatech.integrada;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;

import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

@CapacitorPlugin(name = "IntegradaPDF")
public class IntegradaPDF extends Plugin {
    private static final String MIME = "application/pdf";

    @PluginMethod
    public void open(PluginCall call) {
        String filename = call.getString("filename", "boleto.pdf");
        if (!filename.matches("boleto-[0-9-]+\\.pdf")) {
            call.reject("Nome de arquivo inválido.");
            return;
        }
        if (call.getBoolean("download", false)) {
            Intent save = new Intent(Intent.ACTION_CREATE_DOCUMENT)
                .addCategory(Intent.CATEGORY_OPENABLE)
                .setType(MIME)
                .putExtra(Intent.EXTRA_TITLE, filename);
            try {
                startActivityForResult(call, save, "savePDF");
            } catch (ActivityNotFoundException exception) {
                call.reject("Não foi possível abrir o seletor de arquivos.", exception);
            }
            return;
        }
        File preview = null;
        try {
            File folder = new File(getContext().getCacheDir(), "boletos");
            if (!folder.isDirectory() && !folder.mkdirs()) throw new IOException("Pasta indisponível");
            preview = File.createTempFile("boleto-", ".pdf", folder);
            try (OutputStream output = new FileOutputStream(preview)) {
                output.write(decode(call));
            }
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", preview);
            Intent intent = new Intent(Intent.ACTION_VIEW)
                .setDataAndType(uri, MIME)
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            call.getData().put("preview", preview.getAbsolutePath());
            startActivityForResult(call, intent, "closePDF");
        } catch (ActivityNotFoundException exception) {
            if (preview != null) preview.delete();
            call.reject("Nenhum leitor de PDF instalado. Use Baixar PDF.", exception);
        } catch (IOException | IllegalArgumentException exception) {
            if (preview != null) preview.delete();
            call.reject("Não foi possível abrir o PDF.", exception);
        }
    }

    @ActivityCallback
    private void closePDF(PluginCall call, ActivityResult result) {
        if (call == null) return;
        String preview = call.getString("preview");
        if (preview != null) new File(preview).delete();
        call.resolve();
    }

    @ActivityCallback
    private void savePDF(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null ||
            result.getData().getData() == null) {
            call.resolve();
            return;
        }
        try (OutputStream output = getContext().getContentResolver()
                    .openOutputStream(result.getData().getData(), "wt")) {
            if (output == null) throw new IOException("Arquivo indisponível");
            output.write(decode(call));
            call.resolve();
        } catch (IOException | IllegalArgumentException exception) {
            call.reject("Não foi possível salvar o PDF.", exception);
        }
    }

    private byte[] decode(PluginCall call) {
        String base64 = call.getString("base64", "");
        if (base64.isEmpty() || base64.length() > 5592408) {
            throw new IllegalArgumentException("PDF inválido");
        }
        return Base64.decode(base64, Base64.NO_WRAP);
    }
}
