rm -Rf .git/ && rmdir .git
git init
git add --a
git commit -m "first commit"
git branch -M master
git remote add origin https://jimc052:git005342@github.com/jimc052/scallop.git
git push -u origin master