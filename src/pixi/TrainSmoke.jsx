// src/pixi/TrainSmoke.jsx
import React, { useEffect, useRef } from "react";
import { Application, Container, Graphics } from "pixi.js";

// ───────────── DEBUG ─────────────
const DEBUG_CONSOLE = true;
const log = (...args) => DEBUG_CONSOLE && console.log("[IO][TrainSmoke]", ...args);

// Constants for manually adjusting the smoke origin and behavior
const SMOKE_ORIGIN_X = 116; // Exact horizontal origin for the chimney
const SMOKE_ORIGIN_Y = 44;  // Exact vertical origin for the chimney
const INITIAL_PARTICLE_COUNT = 50; // High particle count during the burst
const NORMAL_PARTICLE_COUNT  = 20; // Particle count after the animation
const ANIMATION_DURATION_FRAMES = 45; // 0.75 seconds at 60 FPS

const START_WIDTH  = 4;  // Initial width of particles
const START_HEIGHT = 6;  // Initial height of particles
const MAX_WIDTH    = 10; // Maximum width as particles rise
const MAX_HEIGHT   = 16; // Maximum height as particles rise
const GROWTH_RATE  = 0.02;  // Rate at which particles grow
const RISE_SPEED   = 0.15;  // Controlled upward motion
const WIND_ANGLE   = 0.3;   // Leftward drift (wind force)
const CURVE_TOP_FACTOR = 1.25; // Controls how rounded the top of the droplet is

const TrainSmoke = ({ paused = false }) => {
  const pixiContainerRef  = useRef(null);
  const appRef            = useRef(null);
  const tickerRunningRef  = useRef(true);

  // flags to prevent repeated logs
  const burstDoneLoggedRef = useRef(false);

  useEffect(() => {
    log("mount");

    let cancelled = false;

    if (pixiContainerRef.current) {
      pixiContainerRef.current.innerHTML = "";
    }

    const app = new Application();

    (async () => {
      try {
        log("PIXI init() start");
        await app.init({
          width: 200,
          height: 200,
          backgroundAlpha: 0
        });
        log("PIXI init() complete", { w: 200, h: 200 });
      } catch (err) {
        console.error("[IO][TrainSmoke] init error:", err);
        return;
      }

      if (cancelled) {
        log("cancelled before attaching canvas");
        app.destroy(true, true);
        return;
      }

      appRef.current = app;

      if (pixiContainerRef.current) {
        pixiContainerRef.current.innerHTML = "";
        pixiContainerRef.current.appendChild(app.canvas);
        log("canvas appended");
      } else {
        console.error("[IO][TrainSmoke] Container ref is null");
        return;
      }

      const smokeContainer = new Container();
      app.stage.addChild(smokeContainer);

      const smokeParticles = [];

      const createParticles = (count) => {
        log("createParticles", count);
        for (let i = 0; i < count; i++) {
          const smokeParticle = new Graphics();
          const baseWidth  = Math.random() * START_WIDTH  + START_WIDTH  / 2;
          const baseHeight = Math.random() * START_HEIGHT + START_HEIGHT / 2;

          smokeParticle
            .moveTo(0, baseHeight)
            .quadraticCurveTo(
              -baseWidth * CURVE_TOP_FACTOR,
              baseHeight / 2,
              0,
              0
            )
            .quadraticCurveTo(
              baseWidth * CURVE_TOP_FACTOR,
              baseHeight / 2,
              0,
              baseHeight
            )
            .closePath()
            .fill({ color: 0xd3d3d3, alpha: Math.random() * 0.5 + 0.5 });

          smokeParticle.x = SMOKE_ORIGIN_X;
          smokeParticle.y = SMOKE_ORIGIN_Y;
          smokeParticle.alpha = Math.random() * 0.8 + 0.2;

          smokeParticles.push(smokeParticle);
          smokeContainer.addChild(smokeParticle);
        }
      };

      // initial burst
      createParticles(INITIAL_PARTICLE_COUNT);
      log("initial burst created", INITIAL_PARTICLE_COUNT);

      let animationFrameCount = 0;

      app.ticker.add(() => {
        animationFrameCount++;

        smokeParticles.forEach((particle, index) => {
          if (particle.scale.x < MAX_WIDTH / START_WIDTH) {
            particle.scale.x += GROWTH_RATE;
            particle.scale.y += GROWTH_RATE;
          }
          particle.y -= RISE_SPEED + Math.random() * 0.1;
          particle.x -= WIND_ANGLE + Math.random() * 0.2;
          particle.alpha -= 0.01;

          if (particle.alpha <= 0) {
            // recycle particle
            particle.y = SMOKE_ORIGIN_Y;
            particle.x = SMOKE_ORIGIN_X;
            particle.scale.set(1, 1);
            particle.alpha = Math.random() * 0.8 + 0.2;
          }

          // trim after burst
          if (
            animationFrameCount > ANIMATION_DURATION_FRAMES &&
            index >= NORMAL_PARTICLE_COUNT
          ) {
            smokeContainer.removeChild(particle);
          }
        });

        if (
          animationFrameCount > ANIMATION_DURATION_FRAMES &&
          !burstDoneLoggedRef.current
        ) {
          smokeParticles.length = NORMAL_PARTICLE_COUNT;
          burstDoneLoggedRef.current = true;
          log("burst complete, trimmed to NORMAL_PARTICLE_COUNT", NORMAL_PARTICLE_COUNT);
        }
      });

      if (paused) {
        app.ticker.stop();
        tickerRunningRef.current = false;
        log("ticker stopped (initial paused=true)");
      } else {
        log("ticker running");
      }
    })();

    return () => {
      cancelled = true;
      log("unmount → destroying PIXI app");
      if (appRef.current) {
        appRef.current.destroy(true, true);
        appRef.current = null;
      }
      if (pixiContainerRef.current) {
        pixiContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  // react to paused prop
  useEffect(() => {
    if (appRef.current) {
      if (paused && tickerRunningRef.current) {
        appRef.current.ticker.stop();
        tickerRunningRef.current = false;
        log("ticker stopped (paused=true)");
      } else if (!paused && !tickerRunningRef.current) {
        appRef.current.ticker.start();
        tickerRunningRef.current = true;
        log("ticker started (paused=false)");
      }
    }
  }, [paused]);

  return (
    <div
      ref={pixiContainerRef}
      style={{
        position: "relative",
        width: "200px",
        height: "200px",
        pointerEvents: "none"
      }}
    />
  );
};

export default TrainSmoke;
