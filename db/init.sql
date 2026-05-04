CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    bart_riesgo FLOAT DEFAULT 0,
    bart_explosiones INTEGER DEFAULT 0,
    mem_eficiencia INTEGER DEFAULT 0,
    mem_velocidad FLOAT DEFAULT 0,
    bj_winrate FLOAT DEFAULT 0,
    coins INTEGER DEFAULT 0,
    perfil_psicologico VARCHAR(255),
    probabilidad_fuga FLOAT DEFAULT 0,
    ciudad VARCHAR(255),
    clima VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predicciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_ia VARCHAR(255) NOT NULL,
    probabilidad FLOAT DEFAULT 1.0,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO usuarios (username, bart_riesgo, bart_explosiones, mem_eficiencia, mem_velocidad, bj_winrate, coins, ciudad, clima) VALUES
--BAJO RIESGO (Estrategas)
('player_pro_1', 25.4, 2, 95, 85.2, 0.75, 5000, 'Bilbao', '18°C'),
('player_pro_2', 30.1, 3, 92, 90.5, 0.68, 4200, 'Madrid', '22°C'),
('player_pro_3', 15.8, 1, 98, 78.9, 0.82, 6100, 'Barcelona', '25°C'),
('player_pro_4', 28.5, 2, 89, 95.1, 0.60, 3800, 'Sevilla', '30°C'),
('player_pro_5', 22.0, 2, 94, 82.4, 0.71, 4500, 'Valencia', '24°C'),

-- MODERADO (Casuals)
('casual_user_1', 55.2, 6, 72, 120.5, 0.45, 1200, 'Vitoria', '15°C'),
('casual_user_2', 48.9, 5, 68, 135.2, 0.42, 1550, 'Donostia', '17°C'),
('casual_user_3', 60.5, 8, 75, 115.8, 0.51, 900, 'Gijon', '14°C'),
('casual_user_4', 52.1, 7, 65, 140.1, 0.38, 1100, 'Santander', '16°C'),
('casual_user_5', 58.4, 6, 70, 128.4, 0.48, 1300, 'Bilbao', '19°C'),

-- ALTO RIESGO (Agresivos)
('risky_gambler_1', 88.5, 15, 45, 210.5, 0.21, 150, 'Malaga', '28°C'),
('risky_gambler_2', 92.1, 18, 38, 250.2, 0.15, 50, 'Murcia', '32°C'),
('risky_gambler_3', 85.4, 14, 52, 195.8, 0.28, 300, 'Alicante', '29°C'),
('risky_gambler_4', 79.9, 12, 41, 220.1, 0.22, 100, 'Almeria', '31°C'),
('risky_gambler_5', 95.0, 20, 35, 280.4, 0.10, 20, 'Cadiz', '27°C');