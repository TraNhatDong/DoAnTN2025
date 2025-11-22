package com.example.signature.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class GpgService {

    @Value("${signature.gpgHome}")
    private String gpgHome;

    @Value("${signature.gpgUser}")
    private String gpgUser;

    @Value("${signature.armored:true}")
    private boolean armored;

    public File signFile(File inputFile) throws Exception {
        File sigOut = File.createTempFile("sig_", ".sig");

        List<String> cmd = new ArrayList<>();
        cmd.add("gpg");
        cmd.add("--batch");
        cmd.add("--yes");
        cmd.add("--homedir");
        cmd.add(gpgHome);
        cmd.add("--local-user");
        cmd.add(gpgUser);
        if (armored) cmd.add("--armor");
        cmd.add("--output");
        cmd.add(sigOut.getAbsolutePath());
        cmd.add("--detach-sign");
        cmd.add(inputFile.getAbsolutePath());

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(true);
        Process p = pb.start();
        boolean finished = p.waitFor(30, TimeUnit.SECONDS);
        if (!finished || p.exitValue() != 0) {
            String err = new String(p.getInputStream().readAllBytes());
            throw new RuntimeException("GPG signing failed: " + err);
        }
        return sigOut;
    }

    public boolean verifySignature(File pdfFile, File sigFile) throws Exception {
        List<String> cmd = new ArrayList<>();
        cmd.add("gpg");
        cmd.add("--homedir");
        cmd.add(gpgHome);
        cmd.add("--verify");
        cmd.add(sigFile.getAbsolutePath());
        cmd.add(pdfFile.getAbsolutePath());

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(true);
        Process p = pb.start();
        boolean finished = p.waitFor(30, TimeUnit.SECONDS);
        String output = new String(p.getInputStream().readAllBytes());
        if (!finished) throw new RuntimeException("Verification timeout");
        return output.contains("Good signature");
    }

    public String exportPublicKey() throws IOException, InterruptedException {
        List<String> cmd = new ArrayList<>();
        cmd.add("gpg");
        cmd.add("--homedir");
        cmd.add(gpgHome);
        cmd.add("--armor");
        cmd.add("--export");
        cmd.add(gpgUser);

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(true);
        Process p = pb.start();
        p.waitFor(10, TimeUnit.SECONDS);

        return new String(p.getInputStream().readAllBytes());
    }
}
