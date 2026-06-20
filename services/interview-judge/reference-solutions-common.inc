#include <algorithm>
#include <array>
#include <cstdlib>
#include <deque>
#include <cctype>
#include <climits>
#include <cmath>
#include <functional>
#include <iostream>
#include <list>
#include <map>
#include <memory>
#include <numeric>
#include <optional>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>
using namespace std;

template <class T> vector<T> readVec(int n) {
  vector<T> a(n);
  for (auto &x : a) cin >> x;
  return a;
}
template <class T> void printVec(const vector<T>& a) {
  for (size_t i=0;i<a.size();++i) {
    if (i) cout << ' ';
    cout << a[i];
  }
  cout << '\n';
}

struct DSU {
  vector<int> p, sz;
  int comps;
  explicit DSU(int n): p(n), sz(n,1), comps(n) { iota(p.begin(), p.end(), 0); }
  int find(int x){ return p[x]==x?x:p[x]=find(p[x]); }
  bool unite(int a,int b){ a=find(a); b=find(b); if(a==b)return false; if(sz[a]<sz[b])swap(a,b); p[b]=a; sz[a]+=sz[b]; --comps; return true; }
};

struct Node { long long v; Node* l=nullptr; Node* r=nullptr; explicit Node(long long x):v(x){} };
Node* readTree() {
  int n; cin >> n;
  if (n<=0) return nullptr;
  vector<string> tok(n);
  for(auto &s:tok) cin>>s;
  if(tok[0]=="null") return nullptr;
  Node* root=new Node(stoll(tok[0]));
  queue<Node*> q; q.push(root);
  int i=1;
  while(!q.empty() && i<n){
    Node* cur=q.front();q.pop();
    if(i<n && tok[i]!="null"){cur->l=new Node(stoll(tok[i]));q.push(cur->l);} ++i;
    if(i<n && tok[i]!="null"){cur->r=new Node(stoll(tok[i]));q.push(cur->r);} ++i;
  }
  return root;
}
void freeTree(Node* n){if(!n)return;freeTree(n->l);freeTree(n->r);delete n;}
