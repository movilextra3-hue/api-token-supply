const express = require('express');
const app = express();
// Render asigna un puerto dinámico mediante la variable de entorno PORT
const port = process.env.PORT || 3000;

app.get('/api/supply', async (req, res) => {
    try {
        const rpcUrl = 'https://api.mainnet-beta.solana.com';
        
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenSupply",
                params: ["6cfzjBSA6KSgUCGDCSPetyDUnxRBG1G1wyE7dLxnL34m"] 
            })
        });

        if (!response.ok) {
            throw new Error(`Error RPC: ${response.status}`);
        }

        const data = await response.json();
        const liveSupply = data.result.value.uiAmount;

        if (typeof liveSupply !== 'number') {
            throw new Error("Formato no numérico.");
        }

        res.json({
            circulatingSupply: liveSupply
        });

    } catch (error) {
        console.error("Fallo detectado:", error.message);
        // Valor de respaldo para mantener la estabilidad en Jupiter
        res.json({
            circulatingSupply: 499999999999.9668
        });
    }
});

app.listen(port, () => {
    console.log(`API MNCA operativa en puerto ${port}`);
});