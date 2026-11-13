#!/usr/bin/env python3
"""Incrusta en index.html efectos de ataque de PMDCollab/RawAsset (carpeta Particle) en el formato de Tactics:
TFT_FXM[nombre]=[alto del frame, nº de frames] (frames cuadrados en una tira horizontal) y TFT_FXS[nombre]=PNG en base64.
Uso: gen_effects.py RAWASSET_PARTICLE_DIR index.html"""
import sys,os,glob,json,base64,io,re
from PIL import Image
import numpy as np
# efectos por Mega (ver MEGAS en gen_mega_sprites.py). Solo tiras sin direcciones (.None)
EFFECTS={
 'aura Mega':['Mega_Background_Red','Mega_Background_Light_Blue','Mega_Background_White','Mega_Background_Yellow'],
 'Charizard X':['Flare_Blitz_Charge_Front','Flare_Blitz_Charge_Back','Flare_Blitz_Hit_Front','Flare_Blitz_Hit_Back','Dragon_Dance','Dragon_Dance_Circle','Fire_Blast','Flamethrower','Fire_Spin_Front','Fire_Spin_Back'],
 'Lucario':['Aura_Sphere','Focus_Energy','Bullet_Punch','Sky_Uppercut','Superpower'],
 'Alakazam':['Psycho_Cut_Cut','Psycho_Cut_Hole','Psych_Up','Focus_Blast_Hit','Miracle_Eye_Glow','Kinesis_Spoon','Psycho_Shift_Hit'],
 'Altaria':['Chatter_Waves','Chatter_Notes','Perish_Song_Front','Perish_Song_Back','Dragon_Pulse_Charge','Roost_Front','Roost_Back','Heal_Bell'],
 'Gengar':['Destiny_Bond','Curse','Grudge_Front','Grudge_Back','Gunk_Shot_Hit','Sludge','Shadow_Sneak_Shadow','Mean_Look'],
 'Gardevoir':['Captivate_Sparkles','Lunar_Dance_Moon','Charm_Heart','Safeguard_Ring_Front','Safeguard_Ring_Back','Magical_Leaf_Charge'],
 'Houndoom':['Dark_Pulse_Back','Nasty_Plot','Will_O_Wisp','Flamethrower_2','Fire_Fang_Fang','Burned'],
 'Medicham':['Hammer_Arm_Fist','Force_Palm_Hand','Wake_Up_Slap','Arm_Thrust','Focus_Energy'],
 'Sableye':['Feint_Hit','Thief_Hit','Shadow_Sneak_Hit','Taunt_Veins','Torment','Payback_Hit'],
 'Mawile':['Metal_Burst_Hit','Swords_Dance','Sucker_Punch_Hit','Giga_Impact_Front','Giga_Impact_Back','Wring_Out'],
}
BEGIN='/* MEGA-FX:BEGIN (generado por tools/gen_effects.py) */';END='/* MEGA-FX:END */'
def sheet(path):
    im=Image.open(path).convert('RGBA');w,h=im.size
    if w%h:raise ValueError('%s: %dx%d no es una tira de frames cuadrados'%(path,w,h))
    b=io.BytesIO()
    if len(set(map(tuple,np.array(im).reshape(-1,4))))<=256:im.convert('P',palette=Image.ADAPTIVE,colors=256).save(b,'PNG',optimize=True)
    else:im.save(b,'PNG',optimize=True)
    return [h,w//h],'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def main(pdir,html):
    s=open(html,encoding='utf-8').read()
    have=set(json.loads(re.search(r'const TFT_FXM=(\{.*?\});',s).group(1)))
    fxm={};fxs={};miss=[];skip=[]
    for grp,names in EFFECTS.items():
        for n in names:
            if n in have or n in fxm:continue
            fl=[f for f in glob.glob(os.path.join(pdir,n+'.*png')) if not re.search(r'\.Dir\d',f)]
            if not fl:miss.append(n);continue
            try:fxm[n],fxs[n]=sheet(fl[0])
            except ValueError as e:skip.append(str(e))
    js=BEGIN+'\nObject.assign(TFT_FXM,'+json.dumps(fxm,separators=(',',':'))+');\nObject.assign(TFT_FXS,{'+','.join('%s:"%s"'%(json.dumps(k),v) for k,v in fxs.items())+'});\n'+END
    if BEGIN in s:
        a=s.index(BEGIN);b=s.index(END)+len(END);s=s[:a]+js+s[b:]
    else:
        m=re.search(r'\nconst TFT_FXS=\{.*?\};\n',s,re.S);assert m
        s=s[:m.end()]+js+'\n'+s[m.end():]
    open(html,'w',encoding='utf-8').write(s)
    print('efectos nuevos:',len(fxm),'bytes',len(js));print('sin archivo:',miss);print('omitidos:',skip)
if __name__=='__main__':main(sys.argv[1],sys.argv[2])
