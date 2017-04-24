> pfrac(5.556)
0.556

> pintg(5.556)
5

> divmod(5,6)
[ 0, 5 ]        # division ; remaining
> divmod(15,6)
[ 2, 3 ]

> negabase(1000,-2,['0','1'])
'10000111000'
> negabase(-1000,-2,['0','1'])
'110001101000'

> negabasetodec('10000111000',['0','1'],-2)
1000
> negabasetodec('110001101000',['0','1'],-2)
-1000
