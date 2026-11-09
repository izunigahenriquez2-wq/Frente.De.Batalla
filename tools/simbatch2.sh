#!/bin/bash
# Segundo lote (tras los ajustes): 4 partidas sin morir + 11 con supervivencia. Uso: simbatch2.sh CARPETA
D=${1:-/tmp/sim2}; mkdir -p $D; cd "$(dirname "$0")/.."
declare -A SP=( [guardian]=95 [striker]=4 [support]=1 [explorer]=133 [mage]=92 [assassin]=41 [alchemist]=7 [engineer]=74 [bard]=25 [chronomancer]=19 [summoner]=1 )
run(){ python3 tools/simbot.py $1 ${SP[$1]} $2 $3 $4 $D/$5.json 2>&1 | tail -1; }
for j in guardian mage; do run $j $((RANDOM%25)) 0 1 god_${j}_1 & done; wait
for j in bard striker; do run $j $((RANDOM%25)) 0 1 god_${j}_1 & done; wait
J=(guardian striker support explorer mage assassin alchemist engineer bard chronomancer summoner)
for ((i=0;i<11;i+=2)); do run ${J[i]} $((RANDOM%25)) 0.2 3 surv_${J[i]} & [ $((i+1)) -lt 11 ] && run ${J[i+1]} $((RANDOM%25)) 0.2 3 surv_${J[i+1]} & wait; done
echo FIN
