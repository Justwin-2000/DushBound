export class Sound {
  constructor(){this.ctx=null;this.noise=null;this.settings={master:.7,music:.45,sfx:.7};this.next=0;this.note=0;this.scene='town';}
  unlock(){try{if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}catch{}}
  tone(freq,duration,volume=.08,type='sine',end=null){const ctx=this.ctx;if(!ctx||ctx.state!=='running'||volume<=0||this.settings.master<=0)return;try{const o=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;o.type=type;o.frequency.setValueAtTime(freq,now);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(1,end),now+duration);gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume*this.settings.master),now+.015);gain.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(gain);gain.connect(ctx.destination);o.start();o.stop(now+duration+.04);o.onended=()=>{o.disconnect();gain.disconnect();};}catch{}}
  play(name){const v=this.settings.sfx*.11;if(name.startsWith('swing')){const i=Number(name.at(-1)||0);this.whoosh(.15+i*.02,v*1.6,1600+i*260,430+i*110);this.tone(300+i*50,.06,v*.3,'triangle',150);}else if(name==='hit'){this.whoosh(.07,v*.9,3000,650);this.tone(145,.12,v,'square',55);}else if(name==='hurt')this.tone(90,.25,v,'sawtooth',32);else if(name==='parry'){this.tone(880,.4,v,'triangle',1300);this.tone(1320,.5,v*.5);}else if(name==='block')this.tone(210,.15,v,'triangle',120);else if(name==='heal'||name==='item'){this.tone(523,.3,v);setTimeout(()=>this.tone(784,.4,v*.7),90);}else if(name==='quest'||name==='victory'){[392,493.88,587.33,783.99].forEach((f,i)=>setTimeout(()=>this.tone(f,.8,v),i*140));}else if(name==='warning'||name==='boss')this.tone(110,.35,v*.6,'sine',80);else if(name==='dodge')this.tone(260,.15,v*.5,'triangle',90);else if(name==='arrow')this.tone(570,.08,v*.5,'triangle',230);else if(name==='death')this.tone(160,1,v,'triangle',60);else this.tone(350,.08,v*.4);}
  tick(scene,paused=false){if(!this.ctx||this.ctx.state!=='running'||paused)return;this.scene=scene;if(this.ctx.currentTime<this.next)return;this.next=this.ctx.currentTime+(scene==='boss'?.48:1.1);const scales=scene==='title'?[220,261.63,329.63,293.66,220,196,164.81,196]:scene==='town'?[261.63,329.63,392,329.63,293.66,220,261.63,196]:scene==='boss'?[110,130.81,110,155.56,146.83,130.81,98,110]:[164.81,196,220,196,164.81,146.83,130.81,146.83];const freq=scales[this.note++%scales.length];this.tone(freq,2.5,this.settings.music*.1);this.tone(freq/2,3,this.settings.music*.05,'triangle');}
  // 挥砍是宽频噪声而不是音调：短促的带通噪声扫频才做出「嗖」的破空声。
  // 噪声缓冲只建一次并复用，随机取一段避免每次听起来一样。
  whoosh(duration,volume,from,to){const ctx=this.ctx;if(!ctx||ctx.state!=='running'||volume<=0||this.settings.master<=0)return;try{
    if(!this.noise){const length=Math.ceil(ctx.sampleRate*.6),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=Math.random()*2-1;this.noise=buffer;}
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),now=ctx.currentTime;
    source.buffer=this.noise;filter.type='bandpass';filter.Q.value=1.1;
    filter.frequency.setValueAtTime(from,now);filter.frequency.exponentialRampToValueAtTime(Math.max(60,to),now+duration);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*this.settings.master),now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
    source.start(now,Math.random()*.4,duration+.04);source.stop(now+duration+.06);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }catch{}}
  suspend(){try{this.ctx?.suspend().catch(()=>{});}catch{}}
}
