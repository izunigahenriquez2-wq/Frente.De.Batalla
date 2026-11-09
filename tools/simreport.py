#!/usr/bin/env python3
import json,glob,sys,statistics as st,collections,os
D=sys.argv[1] if len(sys.argv)>1 else '/tmp/sim'
runs={os.path.basename(f)[:-5]:json.load(open(f)) for f in sorted(glob.glob(D+'/*.json'))}
god={k:v for k,v in runs.items() if k.startswith('god')};sv={k:v for k,v in runs.items() if k.startswith('surv')}
def at(rec,f,key):
    r=[x for x in rec if x.get('f')==f and key in x];return r[0][key] if r else None
def firstf(rec,lv):
    for x in rec:
        if x.get('lv',0)>=lv:return x['f']
print('== PARTIDAS sin morir:',len(god),'| con supervivencia:',len(sv))
print('\n-- Nivel por piso (media de partidas god) --')
for f in [5,10,20,30,40,50,60,70,80]:
    v=[at(r['rec'],f,'lv') for r in god.values()];v=[x for x in v if x];print(f'piso {f:2d}: nivel {st.mean(v):.1f} (min {min(v)} max {max(v)})')
print('\nPiso en que se alcanza el nivel 10/20/30/40:')
for lv in (10,20,30,40):
    v=[firstf(r['rec'],lv) for r in god.values()];v=[x for x in v if x];print(f' nivel {lv}: piso {st.mean(v):.0f} (min {min(v)} max {max(v)})' if v else f' nivel {lv}: no alcanzado')
print('\nXP total acumulada (media):',{f:round(st.mean([at(r['rec'],f,'xpTot') or 0 for r in god.values()])) for f in (10,20,40,60,80)})
print('\n-- Por clase (modo god): nivel final, piso lv40, habilidades, + , talentos, ultis, daño, PS --')
bj=collections.defaultdict(list)
for k,r in god.items():bj[r['info']['job']].append(r)
for j,l in sorted(bj.items()):
    last=[x['rec'][-1] for x in l]
    print(f"{j:12s} lv{statistics_mean:=0}" if False else f"{j:12s} base {l[0]['info']['base']:3d} | piso lv40 {','.join(str(firstf(r['rec'],40) or '-') for r in l):7s} | skillLv {','.join(str(x.get('skillLv')) for x in last)} | + {','.join(str(x.get('plus')) for x in last)} | tal {','.join(str(x.get('tal')) for x in last)} | ultis {','.join(str(x.get('ult')) for x in last)} | dmg {','.join(str(x.get('dmg')) for x in last)} | PS {','.join(str(x.get('hpMax')) for x in last)}")
print('\n-- Tiempo y daño por tramo de pisos (normales, media de todas las partidas god) --')
for a,b in [(1,9),(11,24),(26,39),(41,54),(56,69),(71,79)]:
    xs=[x for r in god.values() for x in r['rec'] if a<=x.get('f',0)<=b and not x.get('boss') and 'secs' in x]
    print(f' pisos {a:2d}-{b:2d}: {st.mean(x["secs"] for x in xs):5.1f}s sim/piso, {st.mean(x["kills"] for x in xs):4.1f} bajas, daño recibido sin esquivar = {st.mean(x["taken"]/x["hpMax"] for x in xs):4.2f} × PS máx por piso, alfas/piso {st.mean(x.get("alphas",0) for x in xs):.2f}')
print('\n-- Jefes (media) piso: duración s, daño recibido/PS --')
for f in range(10,81,5):
    xs=[x for r in god.values() for x in r['rec'] if x.get('f')==f and 'secs' in x]
    if xs:print(f' piso {f}: {st.mean(x["secs"] for x in xs):5.1f}s, {st.mean(x["taken"]/x["hpMax"] for x in xs):4.2f}×PS, formas: {sorted(set(n for x in xs for n in x.get("bossNames",[])))[:4]}')
print('\n-- Equipo al piso 80 (rareza de los 3 objetos) --')
cnt=collections.Counter()
for r in god.values():
    for g in r['rec'][-1].get('gear',[]):cnt[g.split('~')[2] if g.startswith('L~') else 'base']+=1
print(dict(cnt),'(r=raro m=mítico l=legendario u=único según el sistema de botín)')
print('\n-- Cartas elegidas por partida (media):',{k:round(st.mean([r['cards'].get(k,0) for r in god.values()]),1) for k in ('up','plus','tech','st')})
print('\n-- Supervivencia (sin esquivar el 80% del daño) --')
for k,r in sorted(sv.items()):
    last=r['rec'][-1];print(f" {r['info']['job']:12s} {'MUERE piso '+str(last['f'])+' ('+str(r['reason'])+') nv '+str(last.get('lv')) if r['dead'] else 'llega al 80 nv '+str(last.get('lv'))}")
