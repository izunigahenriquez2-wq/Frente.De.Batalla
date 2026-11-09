#!/usr/bin/env python3
"""Genera el arte «+» de Ecos: insignias (assets/tech-icons/plus) y hojas de estallido (assets/plus-fx)."""
from PIL import Image, ImageDraw, ImageFilter
import glob, os, math
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
SRC=ROOT+'/assets/tech-icons/';OUT=SRC+'plus/';FX=ROOT+'/assets/plus-fx/'
os.makedirs(OUT,exist_ok=True);os.makedirs(FX,exist_ok=True)
ACC={'aquaring':(90,200,255),'beam':(255,240,120),'bell':(255,220,120),'discharge':(255,235,90),'dragon':(150,110,255),'fire':(255,120,50),'flame':(255,150,50),'ghost':(170,110,230),'hit':(255,190,110),'ice':(150,230,255),'leaf':(110,220,100),'leech':(190,255,130),'poison':(190,100,230),'protect':(130,200,255),'psychic':(255,120,200),'quake':(210,160,90),'rock':(200,170,110),'sleep':(160,170,255),'spark':(255,235,90),'star':(255,240,150),'swords':(255,150,150),'synthesis':(140,255,160),'water':(90,170,255),'wave':(110,200,255),'whip':(130,230,110)}
GOLD=(242,193,78);GOLD_L=(255,235,160);GOLD_D=(166,118,38);NAVY=(14,24,42);NAVY2=(24,40,66)
N=32
def fit(im,box):
    w,h=im.size;s=min(box/w,box/h)
    if s>=1:s=max(1,int(s));im=im.resize((w*s,h*s),Image.NEAREST)
    else:im=im.resize((max(1,round(w*s)),max(1,round(h*s))),Image.BOX)
    return im
def outline(im,col=(10,16,30,255)):
    big=Image.new('RGBA',(im.width+2,im.height+2),(0,0,0,0));big.paste(im,(1,1),im)
    m=big.split()[3].point(lambda v:255 if v>40 else 0);d=m.filter(ImageFilter.MaxFilter(3))
    o=Image.new('RGBA',big.size,col);o.putalpha(d);o.alpha_composite(big);return o
def icons():
    for name,acc in ACC.items():
        f=SRC+name+'.png'
        if not os.path.exists(f):continue
        base=Image.open(f).convert('RGBA')
        c=Image.new('RGBA',(N,N),(0,0,0,0));d=ImageDraw.Draw(c)
        pts=[(8,0),(23,0),(31,8),(31,23),(23,31),(8,31),(0,23),(0,8)]
        d.polygon(pts,fill=GOLD_D)
        d.polygon([(x+(1 if x<16 else -1),y+(1 if y<16 else -1)) for x,y in pts],fill=GOLD)
        d.polygon([(x+(2 if x<16 else -2),y+(2 if y<16 else -2)) for x,y in pts],fill=NAVY)
        for r in range(11,0,-1):
            k=1-r/11;col=tuple(int(NAVY2[i]*(1-k)+acc[i]*k*.75) for i in range(3));d.ellipse((16-r,17-r,16+r,17+r),fill=col+(255,))
        ic=outline(fit(base,18));c.alpha_composite(ic,(16-ic.width//2,17-ic.height//2))
        for (x,y) in [(3,3),(28,3),(3,28),(28,28)]:d.rectangle((x,y,x+1,y+1),fill=GOLD_L)
        for (x,y) in [(15,0),(15,31),(0,15),(31,15)]:d.point((x,y),fill=(255,255,255,255));d.point((x+1,y),fill=GOLD_L)
        d.ellipse((19,0,31,12),fill=GOLD_D);d.ellipse((20,1,30,11),fill=NAVY)
        d.rectangle((24,3,25,9),fill=GOLD_L);d.rectangle((22,5,27,6),fill=GOLD_L)
        c.resize((N*2,N*2),Image.NEAREST).save(OUT+name+'.png')
S=64;F=8
def star(d,x,y,r,col):
    d.line((x-r,y,x+r,y),fill=col);d.line((x,y-r,x,y+r),fill=col)
    for dx,dy in((-1,-1),(1,-1),(-1,1),(1,1)):d.point((x+dx*(r//2),y+dy*(r//2)),fill=col)
def bursts():
    for name,acc in ACC.items():
        sheet=Image.new('RGBA',(S*F*2,S*2),(0,0,0,0))
        for f in range(F):
            t=f/(F-1);im=Image.new('RGBA',(S,S),(0,0,0,0));d=ImageDraw.Draw(im);c=S//2
            al=int(255*(1-t**2.2));R=10+int(t*21)
            g=GOLD+(al,);gl=GOLD_L+(al,);ac=acc+(int(al*.9),)
            d.ellipse((c-R,c-R,c+R,c+R),outline=g,width=2 if t<.6 else 1)
            r2=int(R*.62);d.ellipse((c-r2,c-r2,c+r2,c+r2),outline=ac,width=2 if t<.5 else 1)
            for i in range(12):
                a=i*math.pi/6+t*1.4;k=5 if i%3==0 else 3
                d.line((c+math.cos(a)*(R+2),c+math.sin(a)*(R+2),c+math.cos(a)*(R+k),c+math.sin(a)*(R+k)),fill=gl)
            if t<.7:
                rr=int(r2*.7);a0=t*2.2
                d.polygon([(c+math.cos(a0+k*math.pi/2)*rr,c+math.sin(a0+k*math.pi/2)*rr) for k in range(4)],outline=gl)
            for k in range(4):
                a=k*math.pi/2+math.pi/4+t*.5;rr=R*(.7+t*.55);star(d,int(c+math.cos(a)*rr),int(c+math.sin(a)*rr),2 if t>.5 else 3,gl)
            for k in range(6):
                a=k*1.1+.4;d.point((int(c+math.cos(a)*R*.72),int(c+math.sin(a)*R*.45-t*14)),fill=ac)
            sheet.alpha_composite(im.resize((S*2,S*2),Image.NEAREST),(f*S*2,0))
        sheet.save(FX+name+'.png')
if __name__=='__main__':icons();bursts();print('ok',len(glob.glob(OUT+'*.png')),len(glob.glob(FX+'*.png')))
