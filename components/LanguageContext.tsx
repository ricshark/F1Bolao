'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'pt';

const defaultTranslations = {
  en: {
    // Landing Page
    live: "Season 2026 is Live",
    title1: "Accelerate Your",
    title2: "Predictions",
    descPre: "Welcome to F1 Bolão! Gather your friends, predict the podium for each Grand Prix, and prove who knows more about Formula 1. A game made ",
    fun: "just for fun",
    descPost: ".",
    startPlaying: "Start Playing",
    signIn: "Sign In",
    langToggle: "🇧🇷 PT-BR",
    
    // Auth & Navigation
    loginTitle: "Login to F1 Bolão",
    logout: "Logout",
    admin: "Admin",
    backToApp: "Back to App",
    loginMsg: "Enter your details to predict the podium and join the race.",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    signUp: "Sign Up",
    nameLabel: "Name",
    emailLabel: "Email",
    passwordLabel: "Password",
    loading: "Loading...",
    
    // Dashboard
    greeting: "Hello",
    subtitle: "Predict the podium and earn points",
    activeGP: "Active Grand Prix",
    activeGPDesc: "Choose your podium finishers before the race starts.",
    upcoming: "Upcoming",
    finished: "Finished",
    loadingRaces: "Loading races...",
    noRaces: "No races found.",
    round: "Round",
    placeOrUpdate: "Place/Update Bet",
    viewResults: "View Results",
    betsLocked: "Bets Locked",
    loginToBet: "Login to Bet",
    
    // Modals
    betOn: "Bet on",
    close: "Close",
    select1st: "Select 1st Place Driver",
    select2nd: "Select 2nd Place Driver",
    select3rd: "Select 3rd Place Driver",
    submitBet: "Submit Bet",
    cancel: "Cancel",
    
    // Admin
    adminTitle: "F1 Bolão Admin",
    adminDesc: "Manage users and bets",
    usersTab: "Users",
    createUserTab: "Create User",
    betsTab: "Bets",
    settingsTab: "Settings",
    calcPoints: "Calculate Points",
    
    // App Navigation
    navDashboard: "Dashboard",
    navRanking: "Ranking",
    navMyBets: "My Bets",
    navStats: "Stats",
    
    // Widgets & Extras
    rankingPlayers: "Player Ranking",
    alexaPromoTitle: "F1 Bolão on Alexa",
    alexaPromoDesc: "Say 'Alexa, open F1 Bolão' to know the next race, register your predictions, see the ranking and much more!",
    alexaPromoBtn: "Install the F1 Bolão Skill on your Alexa now"
  },
  pt: {
    // Landing Page
    live: "Temporada 2026 no Ar",
    title1: "Acelere Seus",
    title2: "Palpites",
    descPre: "Bem-vindo ao F1 Bolão! Reúna seus amigos, faça suas previsões para o pódio de cada Grande Prêmio e dispute quem entende mais de Fórmula 1. Uma brincadeira feita ",
    fun: "apenas para diversão",
    descPost: ".",
    startPlaying: "Começar a Jogar",
    signIn: "Acessar Conta",
    langToggle: "🇺🇸 EN",
    
    // Auth & Navigation
    loginTitle: "Entrar no F1 Bolão",
    logout: "Sair",
    admin: "Painel",
    backToApp: "Voltar",
    loginMsg: "Insira seus dados para palpitar e entrar na corrida.",
    dontHaveAccount: "Não tem uma conta?",
    alreadyHaveAccount: "Já tem uma conta?",
    signUp: "Criar Conta",
    nameLabel: "Nome",
    emailLabel: "E-mail",
    passwordLabel: "Senha",
    loading: "Carregando...",
    
    // Dashboard
    greeting: "Olá",
    subtitle: "Acerte o pódio e ganhe pontos",
    activeGP: "Grandes Prêmios Ativos",
    activeGPDesc: "Escolha quem sobe no pódio antes da corrida começar.",
    upcoming: "Próximas",
    finished: "Encerradas",
    loadingRaces: "Carregando corridas...",
    noRaces: "Nenhuma corrida encontrada.",
    round: "Etapa",
    placeOrUpdate: "Fazer/Editar Palpite",
    viewResults: "Ver Resultados",
    betsLocked: "Palpites Fechados",
    loginToBet: "Logar para Palpitar",
    
    // Modals
    betOn: "Palpitar em",
    close: "Fechar",
    select1st: "1º Lugar (Vencedor)",
    select2nd: "2º Lugar",
    select3rd: "3º Lugar",
    submitBet: "Enviar Palpite",
    cancel: "Cancelar",
    
    // Admin
    adminTitle: "Admin F1 Bolão",
    adminDesc: "Gerenciar usuários e apostas",
    usersTab: "Usuários",
    createUserTab: "Criar Usuário",
    betsTab: "Apostas",
    settingsTab: "Configurações",
    calcPoints: "Calcular Pontos",

    // App Navigation
    navDashboard: "Dashboard",
    navRanking: "Ranking",
    navMyBets: "Minhas Apostas",
    navStats: "Estatísticas",
    
    // Widgets & Extras
    rankingPlayers: "Ranking dos Jogadores",
    alexaPromoTitle: "F1 Bolão na Alexa",
    alexaPromoDesc: "Diga 'Alexa, abrir corrida carros' para saber a próxima corrida, registrar seus palpites, ver ranking e muito mais!",
    alexaPromoBtn: "Instale já a Skill F1 Bolão na sua Alexa"
  }
};

type Translations = typeof defaultTranslations.en;

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('pt'); // Default to portuguese now, wait, user wants english or portuguese? Default PT might be better, but let's default to EN to match previous logic.
  
  useEffect(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('bolao_lang');
    if (saved === 'en' || saved === 'pt') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('bolao_lang', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'pt' : 'en');
  };

  const value = {
    lang,
    setLang,
    t: defaultTranslations[lang],
    toggleLang
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
