define([
        cdnDomain+'/js/plugins/crypto/crypto-js.js'
],function(CryptoJS){
        var key = CryptoJS.enc.Utf8.parse("RWh6MTIzNDU2Nw=="); //16位密钥，与后端tokenSignKey一致
        return  {
                Crypto: CryptoJS, 
                //aes加密
                encrypt: function(word) {
                        var encrypted = "";
                        if (typeof word == "string") {
                                var srcs = CryptoJS.enc.Utf8.parse(word);
                                encrypted = CryptoJS.AES.encrypt(srcs, key, {
                                        mode: CryptoJS.mode.ECB,
                                        padding: CryptoJS.pad.Pkcs7
                                });
                        } else if (typeof word == "object") {
                                //对象格式的转成json字符串
                                var srcs = CryptoJS.enc.Utf8.parse(JSON.stringify(word));
                                encrypted = CryptoJS.AES.encrypt(srcs, key, {
                                        mode: CryptoJS.mode.ECB,
                                        padding: CryptoJS.pad.Pkcs7
                                });
                        }
                        // return encrypted.ciphertext.toString();
                        return encrypted.toString();
                },
                // aes解密
                decrypt: function(word) {
                        var encryptedHexStr = CryptoJS.enc.Base64.parse(word);
                        var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
                        var decrypt = CryptoJS.AES.decrypt(srcs, key, {
                                mode: CryptoJS.mode.ECB,
                                padding: CryptoJS.pad.Pkcs7
                        });
                        var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
                        return decryptedStr.toString();
                }
        };
});