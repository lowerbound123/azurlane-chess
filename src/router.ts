import { createRouter, createWebHistory } from 'vue-router';

export function createGameRouter(history=createWebHistory(import.meta.env?.BASE_URL||'/')) {
  return createRouter({history,scrollBehavior(to,from,saved){return to.meta.battle?false:saved||{top:0};},routes:[
    {path:'/',name:'home',component:()=>import('./pages/HomePage.vue'),meta:{screen:'home'}},
    {path:'/new',name:'new-game',component:()=>import('./pages/NewGamePage.vue'),meta:{screen:'new'}},
    {path:'/new/local',name:'local-fleet',component:()=>import('./pages/LocalFleetPage.vue'),meta:{screen:'fleet'}},
    {path:'/new/ai/:modelId',name:'ai-fleet',component:()=>import('./pages/AIFleetPage.vue'),meta:{screen:'ai-fleet',online:true}},
    {path:'/rooms/create',name:'room-create',component:()=>import('./pages/RoomCreatePage.vue'),meta:{screen:'online',online:true}},
    {path:'/rooms/join',name:'room-join',component:()=>import('./pages/RoomJoinPage.vue'),meta:{screen:'online',online:true}},
    {path:'/rooms/:code',name:'room',component:()=>import('./pages/OnlineFlowPage.vue'),meta:{screen:'online',online:true}},
    {path:'/matchmaking',name:'matchmaking',component:()=>import('./pages/MatchmakingPage.vue'),meta:{screen:'online',online:true}},
    {path:'/matches/:matchId/draft',name:'draft',component:()=>import('./pages/OnlineFlowPage.vue'),meta:{screen:'online',online:true}},
    {path:'/battle/local',name:'local-battle',component:()=>import('./pages/BattlePage.vue'),meta:{screen:'battle',battle:true}},
    {path:'/battle/online/:matchId',name:'online-battle',component:()=>import('./pages/BattlePage.vue'),meta:{screen:'battle',battle:true,online:true}},
    {path:'/saves',name:'saves',component:()=>import('./pages/SavePage.vue'),meta:{screen:'saves'}},
    {path:'/guide',name:'guide',component:()=>import('./pages/GuidePage.vue'),meta:{screen:'book'}},
    {path:'/tutorial',name:'tutorial',component:()=>import('./pages/TutorialPage.vue'),meta:{screen:'lessons'}},
    {path:'/tutorial/campaign',name:'campaign',component:()=>import('./pages/BattlePage.vue'),meta:{screen:'battle',battle:true}},
    {path:'/tutorial/:lessonId',name:'lesson',component:()=>import('./pages/BattlePage.vue'),meta:{screen:'battle',battle:true}},
    {path:'/:pathMatch(.*)*',name:'not-found',component:()=>import('./pages/NotFoundPage.vue'),meta:{screen:'not-found'}},
  ]});
}
