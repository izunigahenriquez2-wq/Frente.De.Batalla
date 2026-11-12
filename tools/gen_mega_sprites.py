#!/usr/bin/env python3
"""Convierte sprites de PMDCollab (SpriteCollab) al formato de atlas de Tactics (PMTM/PMTS).
Uso: gen_mega_sprites.py SPRITE_ROOT OUT_JSON  [--check DEX ...]
Formato de cada animación: [sy, w, h, nFrames, ax, ay, [ms por frame], bo]
  - fila 6 de la hoja (mirando a la izquierda), recortada al rectángulo común de todos los frames
  - ax = centro del frame - borde izquierdo del recorte ; ay = fila de la sombra - borde superior ; bo = h - ay
  - atlas = animaciones apiladas en vertical sin huecos, PNG indexado
"""
import sys,json,base64,io,os
import xml.etree.ElementTree as ET
from PIL import Image
import numpy as np
CODES={'W':'Walk','I':'Idle','H':'Hurt','A':'Attack','C':'Charge','T':'Shoot','G':'Swing','D':'Double','F':'Faint','S':'Sleep','O':'Hop'}
def anims(root):
    t=ET.parse(os.path.join(root,'AnimData.xml')).getroot();d={}
    for a in t.iter('Anim'):
        n=a.find('Name').text;cp=a.find('CopyOf')
        d[n]=dict(copy=cp.text if cp is not None else None,
            fw=int(a.find('FrameWidth').text) if a.find('FrameWidth') is not None else None,
            fh=int(a.find('FrameHeight').text) if a.find('FrameHeight') is not None else None,
            du=[int(x.text) for x in a.iter('Duration')])
    return d
def build(root,codes=CODES):
    A=anims(root);ents={};tiles=[]
    for code,name in codes.items():
        a=A.get(name)
        if not a:continue
        src=name
        if a['copy']:src=a['copy'];b=A.get(src);a=dict(a,fw=b['fw'],fh=b['fh'],du=b['du'] or a['du'])
        if not a['du'] or not a['fw']:continue
        fn=os.path.join(root,src+'-Anim.png')
        if not os.path.exists(fn):continue
        fw,fh,du=a['fw'],a['fh'],a['du'];nf=len(du)
        im=np.array(Image.open(fn).convert('RGBA'));rows=im.shape[0]//fh;r=6 if rows>=8 else 0
        sh=np.array(Image.open(os.path.join(root,src+'-Shadow.png')).convert('RGBA')) if os.path.exists(os.path.join(root,src+'-Shadow.png')) else None
        x0,y0,x1,y1=10**6,10**6,-1,-1  # ints de python
        for f in range(nf):
            ys,xs=np.nonzero(im[r*fh:(r+1)*fh,f*fw:(f+1)*fw,3])
            if len(xs):x0=min(x0,int(xs.min()));x1=max(x1,int(xs.max()));y0=min(y0,int(ys.min()));y1=max(y1,int(ys.max()))
        if x1<0:continue
        w,h=x1-x0+1,y1-y0+1
        sy=fh-1
        if sh is not None:
            ys,_=np.nonzero(sh[r*fh:(r+1)*fh,0:fw,3])
            if len(ys):sy=int(ys.min())   # fila de sombra del primer frame
        ax=fw//2-x0;ay=sy-y0
        if ay>h:ay=h
        if ay<0:ay=0
        tile=np.zeros((h,nf*w,4),np.uint8)
        for f in range(nf):tile[:,f*w:(f+1)*w]=im[r*fh+y0:r*fh+y1+1,f*fw+x0:f*fw+x1+1]
        tiles.append((code,tile,[w,h,nf,ax,ay,[round(x*1000/60) for x in du],h-ay]))
    return tiles
def atlas(tiles):
    W=max(t.shape[1] for _,t,_ in tiles);H=sum(t.shape[0] for _,t,_ in tiles)
    out=np.zeros((H,W,4),np.uint8);m={};y=0
    for code,t,e in tiles:
        out[y:y+t.shape[0],:t.shape[1]]=t;m[code]=[y]+e;y+=t.shape[0]
    return Image.fromarray(out),m
def png_uri(im):
    q=im.convert('RGBA')
    cols=len(set(map(tuple,np.array(q).reshape(-1,4))))
    b=io.BytesIO()
    if cols<=256:q.convert('P',palette=Image.ADAPTIVE,colors=256).save(b,'PNG',optimize=True)
    else:q.save(b,'PNG',optimize=True)
    return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
# línea inicial de Tactics -> (dex de la Mega en PMDCollab, forma). Clave de sprite = 10000+dex
MEGAS={4:(6,'0001'),447:(448,'0001'),63:(65,'0001'),333:(334,'0001'),92:(94,'0001'),280:(282,'0001'),228:(229,'0001'),307:(308,'0001'),302:(302,'0001'),303:(303,'0001')}
BEGIN='/* MEGA-SPRITES:BEGIN (generado por tools/gen_mega_sprites.py) */';END='/* MEGA-SPRITES:END */'
def embed(spritedir,html):
    meta={};sheets={};tfm={}
    for line,(dex,form) in MEGAS.items():
        im,m=atlas(build(os.path.join(spritedir,'%04d'%dex,form)))
        k=10000+dex;meta[k]=m;sheets[k]=png_uri(im);tfm[line]=k
    js=BEGIN+'\nObject.assign(PMTM,'+json.dumps({str(k):v for k,v in meta.items()},separators=(',',':'))+');\nObject.assign(PMTS,{'+','.join('%d:"%s"'%(k,v) for k,v in sheets.items())+'});\n/* línea del inicial -> clave del sprite Mega */\nconst TFT_MEGA='+json.dumps({str(a):b for a,b in tfm.items()},separators=(',',':'))+';\n'+END
    s=open(html,encoding='utf-8').read()
    if BEGIN in s:
        a=s.index(BEGIN);b=s.index(END)+len(END);s=s[:a]+js+s[b:]
    else:
        key="PMS[k]=PMTS[k]}})();\n"
        assert s.count(key)==1;p=s.index(key)+len(key);s=s[:p]+js+'\n'+s[p:]
    open(html,'w',encoding='utf-8').write(s);return len(js)
if __name__=='__main__':
    if sys.argv[1]=='--embed':print('bytes',embed(sys.argv[2],sys.argv[3]));sys.exit()
    root=sys.argv[1]
    im,m=atlas(build(root));print(json.dumps(m,separators=(',',':')));print(im.size)
