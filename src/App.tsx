import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Film, 
  Calendar, 
  ChevronRight, 
  Moon, 
  Sun, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Clock, 
  Award, 
  X, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { DailyBoxOffice, MovieDetail } from './types';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Calculate yesterday string for default date: YYYY-MM-DD
  const getYesterdayDateString = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // State
  const [selectedDate, setSelectedDate] = useState<string>(getYesterdayDateString());
  const [boxOfficeList, setBoxOfficeList] = useState<DailyBoxOffice[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);

  // Selected movie for detail panel
  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);
  const [movieDetail, setMovieDetail] = useState<MovieDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Maximum date restriction (Strictly before today, which means max date is yesterday)
  const maxDateString = getYesterdayDateString();

  // Apply dark mode theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Fetch Box Office dynamic
  const fetchBoxOffice = async (dateStr: string) => {
    setLoadingList(true);
    setListError(null);
    try {
      const apiDate = dateStr.replace(/-/g, ''); // Convert YYYY-MM-DD to YYYYMMDD
      const response = await fetch(`/api/boxoffice?date=${apiDate}`);
      if (!response.ok) {
        throw new Error(`박스오피스 데이터를 불러오는데 실패했습니다. (HTTP ${response.status})`);
      }
      const data = await response.json();
      
      if (data.boxOfficeResult?.dailyBoxOfficeList) {
        setBoxOfficeList(data.boxOfficeResult.dailyBoxOfficeList);
      } else {
        setBoxOfficeList([]);
        if (data.message) {
          throw new Error(data.message);
        }
      }
    } catch (err: any) {
      console.error(err);
      setListError(err.message || '데이터 요청 중 문제가 발생했습니다.');
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch Movie details
  const fetchMovieDetail = async (movieCd: string) => {
    setLoadingDetail(true);
    setDetailError(null);
    setMovieDetail(null);
    try {
      const response = await fetch(`/api/movie?movieCd=${movieCd}`);
      if (!response.ok) {
        throw new Error(`영화 정보를 불러오는데 실패했습니다. (HTTP ${response.status})`);
      }
      const data = await response.json();
      if (data.movieInfoResult?.movieInfo) {
        setMovieDetail(data.movieInfoResult.movieInfo);
      } else {
        throw new Error('영화 상세 정보 데이터를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setDetailError(err.message || '상세 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Load box office on initial rendering or date change
  useEffect(() => {
    fetchBoxOffice(selectedDate);
  }, [selectedDate]);

  // Load details when movie code changes
  useEffect(() => {
    if (selectedMovieCd) {
      fetchMovieDetail(selectedMovieCd);
    }
  }, [selectedMovieCd]);

  // Utility formatting helpers
  const formatNumber = (numStr: string) => {
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return numStr;
    return num.toLocaleString();
  };

  const formatCurrencyInManWon = (wonStr: string) => {
    const won = parseInt(wonStr, 10);
    if (isNaN(won)) return wonStr;
    const manwon = Math.round(won / 10000);
    if (manwon >= 10000) {
      const eok = (manwon / 10000).toFixed(1);
      return `${eok}억 원`;
    }
    return `${manwon.toLocaleString()}만 원`;
  };

  const parseKobisDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
  };

  return (
    <div className="min-h-screen transition-colors duration-500 font-sans bg-[#f3f4f6] text-slate-900 dark:bg-[#050510] dark:text-slate-200 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background radial glows per design specifications */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.06)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(244,63,94,0.06)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_30%,#1e1b4b_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#312e81_0%,transparent_50%)] opacity-70 pointer-events-none z-0"></div>

      {/* HEADER BAR with glass blur navbar design */}
      <header className="sticky top-0 z-30 border-b border-white/20 dark:border-white/10 bg-white/25 dark:bg-white/5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Film className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent block">
                CineScope
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-slate-500 dark:text-slate-400 block -mt-1 font-bold">
                KOREAN FILM COUNCIL REALTIME API
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Header Date Input with capsule border */}
            <div className="flex items-center bg-white/40 dark:bg-white/10 border border-slate-300/40 dark:border-white/20 rounded-full px-4 py-1.5 backdrop-blur-xl transition-all shadow-xs hover:border-slate-300 dark:hover:border-white/30">
              <span className="text-xs font-bold mr-2 text-slate-500 dark:text-slate-400">조회 일자</span>
              <input
                id="boxoffice-date-picker"
                type="date"
                value={selectedDate}
                max={maxDateString}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                className="bg-transparent text-sm font-semibold border-none outline-none focus:ring-0 text-slate-800 dark:text-white cursor-pointer"
              />
            </div>

            {/* Light/Dark Toggle */}
            <button
              id="theme-toggler"
              onClick={() => setIsDarkMode(prev => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300/40 dark:border-white/10 bg-white/50 dark:bg-white/5 shadow-xs hover:scale-105 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-indigo-600 dark:text-amber-400 cursor-pointer"
              title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD HERO / CONTROLS */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 p-6 sm:p-8 rounded-[2rem] bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                일별 흥행 데이터 시각화
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                영화진흥위원회 KOBIS 데이터를 바탕으로 업데이트된 박스오피스 정보입니다. 장르, 감독, 스탭 및 참여 회사 등 깊이 있는 정보를 탐색할 수 있습니다.<br />
                <span className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-bold mt-1.5">
                  ⚠️ 오늘 날짜 이전(어제까지)의 완료된 데이터만 조회가 가능합니다.
                </span>
              </p>
            </div>
            <div>
              <button
                id="refresh-btn"
                onClick={() => fetchBoxOffice(selectedDate)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold bg-white/80 dark:bg-indigo-500/10 hover:bg-white dark:hover:bg-indigo-500/20 border border-slate-200 dark:border-indigo-500/30 text-indigo-750 dark:text-indigo-400 transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" /> 다시 불러오기
              </button>
            </div>
          </div>
        </div>

        {/* CONTAINER GRID: LIST & DETAILS SPLIT SCREEN */}
        <div className="grid gap-8 lg:grid-cols-5 items-start">
          {/* Left Panel: Box Office List */}
          <section className="lg:col-span-3 flex flex-col bg-white/20 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-2xl rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center bg-white/10 dark:bg-white/2">
              <h3 className="text-xl font-bold uppercase tracking-widest text-indigo-650 dark:text-indigo-400">
                Box Office
              </h3>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-indigo-500/10 text-indigo-650 dark:text-indigo-300 rounded-full">
                {parseKobisDate(selectedDate.replace(/-/g, ''))}
              </span>
            </div>

            <div className="p-4 space-y-3.5 max-h-[700px] overflow-y-auto custom-scrollbar">
              {/* Error or Loading states */}
              {loadingList ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-5 bg-white/40 dark:bg-white/5 border border-white/5 rounded-2xl">
                      <div className="flex items-center gap-4 w-2/3">
                        <div className="h-10 w-10 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
                        <div className="space-y-2 w-full">
                          <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded-sm w-3/4"></div>
                          <div className="h-3 bg-slate-300 dark:bg-slate-800 rounded-sm w-1/2"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded-md w-16"></div>
                    </div>
                  ))}
                </div>
              ) : listError ? (
                <div id="error-banner" className="p-8 text-center bg-rose-500/5 dark:bg-rose-500/10 border border-rose-200/30 dark:border-rose-900/30 rounded-2xl">
                  <p className="text-rose-600 dark:text-rose-450 font-bold">{listError}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">일시적인 통신 장애나 데이터 누락일 수 있습니다.</p>
                  <button
                    id="error-retry"
                    onClick={() => fetchBoxOffice(selectedDate)}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-500 shadow-md shadow-indigo-650/15 cursor-pointer"
                  >
                    다시 검색하기
                  </button>
                </div>
              ) : boxOfficeList.length === 0 ? (
                <div id="empty-state" className="p-12 text-center bg-white/20 dark:bg-white/5 border border-white/5 rounded-[2rem] shadow-xs">
                  <HelpCircle className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400 font-bold">해당 일자의 박스오피스 정보가 없습니다.</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">다른 과거 관람 날짜를 선택하여 흥행 기록를 살펴보세요.</p>
                </div>
              ) : (
                // Real Box Office list in Frosted Glass design
                boxOfficeList.map((movie, index) => {
                  const isSelected = selectedMovieCd === movie.movieCd;
                  const isNew = movie.rankOldAndNew === 'NEW';
                  const rankInten = parseInt(movie.rankInten, 10);

                  return (
                    <motion.div
                      id={`movie-item-${movie.movieCd}`}
                      key={movie.movieCd}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      onClick={() => setSelectedMovieCd(movie.movieCd)}
                      className={`group relative flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-white/75 dark:bg-white/10 dark:border-white/20 border-indigo-500 ring-2 ring-indigo-500/20' 
                          : 'bg-white/30 hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/8 border-transparent hover:border-slate-300 dark:hover:border-white/10'
                      }`}
                    >
                      {/* Left: Heavy numerical rank + Movie metadata */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className={`text-[2rem] font-black italic mr-2 shrink-0 select-none leading-none tracking-tighter ${
                          movie.rank === '1' ? 'text-indigo-600 dark:text-indigo-500 opacity-100' :
                          movie.rank === '2' ? 'text-slate-600 dark:text-slate-400 opacity-80' :
                          movie.rank === '3' ? 'text-rose-500 dark:text-rose-400 opacity-80' :
                          'text-slate-400 dark:text-slate-600 opacity-40'
                        }`}>
                          {movie.rank.padStart(2, '0')}
                        </span>

                        <div className="min-w-0">
                          <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {movie.movieNm}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                            <span className="font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md text-[10px]">
                              개봉 {movie.openDt}
                            </span>
                            <span className="text-slate-400 dark:text-slate-650">•</span>
                            <span className="font-mono">
                              오늘 {formatNumber(movie.audiCnt)}명 / 누적 {formatNumber(movie.audiAcc)}명
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Right side: Rank Intent change indicators */}
                      <div className="flex items-center gap-4 shrink-0 ml-4 text-right">
                        <div className="hidden sm:block">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            매출 {movie.salesShare}%
                          </p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            {formatCurrencyInManWon(movie.salesAcc)}
                          </p>
                        </div>

                        {/* Rank intensity badge */}
                        <div className="min-w-14 text-center">
                          {isNew ? (
                            <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full dark:text-emerald-400">NEW</span>
                          ) : rankInten > 0 ? (
                            <span className="text-xs font-bold text-rose-500 dark:text-rose-450 bg-rose-500/10 px-2.5 py-1 rounded-full inline-flex items-center gap-0.5">
                              <TrendingUp className="h-3 w-3" />{rankInten}
                            </span>
                          ) : rankInten < 0 ? (
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full inline-flex items-center gap-0.5">
                              <TrendingDown className="h-3 w-3" />{Math.abs(rankInten)}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full">-</span>
                          )}
                        </div>

                        <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 translate-x-0 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </section>

          {/* Right Panel: Breathtaking Frosted Glass Movie Details */}
          <section className="lg:col-span-2 lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {!selectedMovieCd ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-8 text-center bg-white/10 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center min-h-[480px]"
                >
                  <Award className="h-12 w-12 text-indigo-600/30 dark:text-indigo-500/30 mb-4" />
                  <p className="text-slate-700 dark:text-slate-300 font-extrabold text-base">영화 상세 정보</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[240px] leading-relaxed">
                    왼쪽의 박스오피스 목록에서 영화 제목을 클릭하시면 장르, 상영 시간, 감독 및 상세한 출연진 정보를 CineScope 뷰로 감상하실 수 있습니다.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedMovieCd}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="bg-white/40 dark:bg-white/10 border border-slate-200 dark:border-white/20 backdrop-blur-3xl rounded-[2rem] p-8 lg:p-10 overflow-hidden relative"
                >
                  {/* Decorative background digits using movie Cd as watermark */}
                  {movieDetail && (
                    <div className="absolute top-0 right-0 p-8 lg:p-10 opacity-5 select-none pointer-events-none">
                      <span className="text-[6rem] lg:text-[8rem] font-black leading-none italic font-mono tracking-tighter text-slate-800 dark:text-white">
                        {movieDetail.movieCd}
                      </span>
                    </div>
                  )}

                  {/* Close button inside detailed explorer */}
                  <button
                    id="close-movie-detail-btn"
                    onClick={() => setSelectedMovieCd(null)}
                    className="absolute top-6 right-6 z-20 h-8 w-8 rounded-full bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-slate-650 dark:text-slate-350 border border-transparent dark:border-white/10 cursor-pointer"
                    title="닫기"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="relative z-10 flex flex-col h-full space-y-6">
                    {/* Upper heading segment */}
                    <div>
                      {loadingDetail ? (
                        <div className="h-6 w-1/3 bg-slate-300 dark:bg-slate-800 rounded-md animate-pulse mb-3"></div>
                      ) : movieDetail ? (
                        <span className="px-3.5 py-1.5 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/30">
                          {movieDetail.typeNm || '장편'} · {movieDetail.statusNm || '개봉'}
                        </span>
                      ) : null}

                      <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-4 leading-tight tracking-tight">
                        {loadingDetail ? (
                          <div className="h-9 w-3/4 bg-slate-300 dark:bg-slate-800 rounded-md animate-pulse"></div>
                        ) : movieDetail ? (
                          movieDetail.movieNm
                        ) : '데이터 조회 중...'}
                      </h3>

                      {!loadingDetail && movieDetail && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold italic mt-1 font-serif">
                          {movieDetail.movieNmEn || movieDetail.movieNmOg || 'English Title N/A'}
                        </p>
                      )}
                    </div>

                    {/* Mid technical segment */}
                    {loadingDetail ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="h-12 bg-slate-300 dark:bg-slate-850 rounded-xl"></div>
                          <div className="h-12 bg-slate-300 dark:bg-slate-850 rounded-xl"></div>
                          <div className="h-12 bg-slate-300 dark:bg-slate-850 rounded-xl"></div>
                        </div>
                        <div className="h-20 bg-slate-300 dark:bg-slate-850 rounded-2xl w-full"></div>
                      </div>
                    ) : detailError ? (
                      <div id="movie-detail-error" className="py-8 text-center bg-rose-500/5 dark:bg-rose-500/10 border border-rose-200/40 dark:border-rose-900/40 rounded-xl">
                        <p className="text-rose-600 dark:text-rose-400 font-bold text-sm">{detailError}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">네트워크 통신 중 에러가 발생했습니다.</p>
                      </div>
                    ) : movieDetail ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-300/40 dark:border-white/10">
                          <div className="space-y-5">
                            {/* Director */}
                            <div>
                              <h4 className="text-[10px] uppercase tracking-widest text-indigo-700 dark:text-indigo-400 font-extrabold mb-1.5">Director</h4>
                              {movieDetail.directors && movieDetail.directors.length > 0 ? (
                                movieDetail.directors.map(dir => (
                                  <p key={dir.peopleNm} className="text-sm font-bold text-slate-850 dark:text-slate-200">
                                    {dir.peopleNm} {dir.peopleNmEn && <span className="text-[11px] text-slate-550 dark:text-slate-400 font-mono font-medium">({dir.peopleNmEn})</span>}
                                  </p>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400">등록된 감독 정보가 성실히 수집되지 않았습니다.</p>
                              )}
                            </div>

                            {/* Cast info with customized chips */}
                            <div>
                              <h4 className="text-[10px] uppercase tracking-widest text-indigo-700 dark:text-indigo-400 font-extrabold mb-2.5">Cast</h4>
                              {movieDetail.actors && movieDetail.actors.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                                  {movieDetail.actors.slice(0, 8).map((actor, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-white/80 dark:bg-white/5 rounded-full text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 shadow-xs">
                                      {actor.peopleNm} {actor.cast && <span className="text-[10px] text-rose-500 font-normal ml-0.5">({actor.cast})</span>}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">배우 정보가 존재하지 않습니다.</p>
                              )}
                            </div>

                            {/* Standard specifications */}
                            <div>
                              <h4 className="text-[10px] uppercase tracking-widest text-indigo-700 dark:text-indigo-400 font-extrabold mb-2">Info</h4>
                              <div className="flex gap-4">
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">개봉일</p>
                                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{movieDetail.openDt || 'N/A'}</p>
                                </div>
                                <div className="h-6 w-px bg-slate-300 dark:bg-white/10 self-center"></div>
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">러닝타임</p>
                                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{movieDetail.showTm ? `${movieDetail.showTm}분` : 'N/A'}</p>
                                </div>
                                <div className="h-6 w-px bg-slate-300 dark:bg-white/10 self-center"></div>
                                <div className="min-w-0">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">등급</p>
                                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={movieDetail.audits?.[0]?.watchGradeNm}>
                                    {movieDetail.audits?.[0]?.watchGradeNm || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Extra plots / companies */}
                          <div className="flex flex-col justify-end">
                            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                              <h4 className="text-[10px] uppercase tracking-widest text-indigo-750 dark:text-indigo-300 font-extrabold mb-2.5">
                                Metadata & Distribution
                              </h4>
                              
                              <div className="space-y-3">
                                <div>
                                  <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold block mb-0.5">대표 장르 / 제작지</span>
                                  <p className="font-semibold text-slate-800 dark:text-slate-250">
                                    {movieDetail.genres?.map(g => g.genreNm).join(', ') || 'N/A'} · {movieDetail.nations?.map(n => n.nationNm).join(', ') || 'N/A'}
                                  </p>
                                </div>

                                {movieDetail.companys && movieDetail.companys.length > 0 && (
                                  <div>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold block mb-1">관련 회사</span>
                                    <div className="space-y-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                                      {movieDetail.companys.slice(0, 3).map((comp, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                          <span className="h-1 w-1 bg-indigo-500 rounded-full"></span>
                                          <p className="font-medium truncate text-[11px]">{comp.companyNm} <span className="text-[9px] text-indigo-600/80 dark:text-indigo-400">({comp.companyPartNm})</span></p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer details */}
                        <div className="mt-auto pt-6 border-t border-slate-350/40 dark:border-white/10 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-450 uppercase tracking-widest">
                          <span>Movie Code: {movieDetail.movieCd}</span>
                          <span>Copyright KOBIS API 2026</span>
                        </div>
                      </>
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="mt-20 border-t border-slate-300/40 dark:border-white/10 py-8 text-center bg-white/20 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            KOREAN FILM COUNCIL BOX OFFICE INFORMATION SYSTEM (KOBIS)
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            본 매일 박스오피스 탐색 서비스는 영화진흥위원회(KOBIS) OpenAPI를 이용해 한국 극장가 실시간 흥행 실적을 투명하게 시각화합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
