/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

interface DeployResult {
  success: boolean;
  url?: string;
  error?: string;
}

const ORG = 'Website-Builder-Realty-Genie';

async function repoExists(octokit: any, repo: string): Promise<boolean> {
  try {
    await octokit.repos.get({
      owner: ORG,
      repo,
    });
    return true;
  } catch (err: any) {
    if (err.status === 404) return false;
    if (err.status === 500) {
      console.log('GitHub API 500, assuming repo exists:', repo);
      return true;
    }
    return false;
  }
}

function generateRealEstateHTML(details: Record<string, string>): string {
  const {
    companyName = 'Sarah Mitchell',
    tagline = 'Your Trusted Real Estate Partner',
    brokerageName = 'RealtyGinie',
    licenseNumber = '',
    heroImage = '',
    email = 'sarah@realestate.com',
    phone = '(604) 555-0192',
    city = 'Vancouver',
    province = 'BC',
    heroTitle = 'Find Your Home. Move with Confidence.',
    heroSubtitle = 'Part of BC\'s #1-ranked team. Every buyer and seller gets the speed, strategy, and personal attention that gets results.',
    homesSOLD = '80+',
    yearsExp = '10+',
    rating = '5.0',
    neighborhood1 = 'Vancouver West',
    neighborhood2 = 'East Vancouver',
    neighborhood3 = 'Burnaby',
    neighborhood4 = 'Surrey',
    neighborhood5 = 'Richmond',
    neighborhood6 = 'New Westminster',
    price1 = '$2,100,000',
    price2 = '$1,400,000',
    price3 = '$1,200,000',
    price4 = '$950,000',
    price5 = '$1,300,000',
    price6 = '$850,000',
    review1Name = 'Nirmala P.',
    review1Text = 'She patiently visited multiple homes with us, taking the time to clearly explain the pros and cons of each option.',
    review1Type = 'House',
    review2Name = 'Ashwani J.',
    review2Text = 'Finding the right property can be overwhelming, but she made the entire process smooth and stress-free.',
    review2Type = 'Condo',
    review3Name = 'Anna Can',
    review3Text = 'Mallika was absolutely amazing to work with! She was professional, knowledgeable, and always available to answer our questions.',
    review3Type = 'House',
    agentPhotoUrl = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
    googleReviewsUrl = '#',
    instagramHandle = '',
    teamName = '',
    teamRank = '#1',
    accentDark = '#0a0a0f',
    services = 'Home Buying\nHome Selling\nInvestment Properties',
    about = 'With a passion for real estate and a deep understanding of the local market, I\'m dedicated to making your home buying or selling experience exceptional.',
  } = details;

  const goldColor = '#C9A96E';

  const heroPhotoUrl = heroImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80&auto=format';

  const provinceName: Record<string, string> = {
    ON: 'Ontario', BC: 'British Columbia', AB: 'Alberta', QC: 'Quebec',
    MB: 'Manitoba', SK: 'Saskatchewan', NS: 'Nova Scotia', NB: 'New Brunswick',
    NL: 'Newfoundland', PE: 'Prince Edward Island', NT: 'Northwest Territories',
    YT: 'Yukon', NU: 'Nunavut',
  };
  const provFull = provinceName[province] || province;
  const servicesList = services.split('\n').filter(s => s.trim());

  const propertyImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80&auto=format',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80&auto=format',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format',
  ];

  const igImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80&auto=format',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&q=80&auto=format',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80&auto=format',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&auto=format',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80&auto=format',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&q=80&auto=format',
  ];

  const neighborhoodImages = [
    'https://images.unsplash.com/photo-1559517282-523965c5a9c9?w=600&q=80&auto=format',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80&auto=format',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&auto=format',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80&auto=format',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&q=80&auto=format',
  ];

  const neighborhoods = [
    { name: neighborhood1, price: price1, image: neighborhoodImages[0] },
    { name: neighborhood2, price: price2, image: neighborhoodImages[1] },
    { name: neighborhood3, price: price3, image: neighborhoodImages[2] },
    { name: neighborhood4, price: price4, image: neighborhoodImages[3] },
    { name: neighborhood5, price: price5, image: neighborhoodImages[4] },
    { name: neighborhood6, price: price6, image: neighborhoodImages[5] },
  ];

  const reviews = [
    { name: review1Name, text: review1Text, type: review1Type },
    { name: review2Name, text: review2Text, type: review2Type },
    { name: review3Name, text: review3Text, type: review3Type },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName} | ${city} Realtor — ${brokerageName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --gold: ${goldColor};
      --gold-light: ${goldColor}33;
      --gold-mid: ${goldColor}88;
      --dark: ${accentDark};
      --dark-2: #13131a;
      --dark-3: #1c1c26;
      --white: #ffffff;
      --off-white: #faf9f7;
      --gray-100: #f4f3f0;
      --gray-200: #e8e6e1;
      --gray-400: #9d9b95;
      --gray-500: #6b6963;
      --gray-700: #3a3935;
      --gray-900: #1a1917;
    }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; color: var(--gray-700); background: var(--white); line-height: 1.65; overflow-x: hidden; }
    a { text-decoration: none; color: inherit; }
    img { max-width: 100%; display: block; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
    header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--gray-200); transition: all 0.3s ease; }
    .header-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; gap: 24px; }
    .logo-wrap { display: flex; flex-direction: column; }
    .logo-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--gray-900); letter-spacing: -0.3px; line-height: 1; }
    .logo-sub { font-size: 11px; font-weight: 400; color: var(--gold); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; }
    nav { display: flex; align-items: center; gap: 28px; }
    nav a { font-size: 14px; font-weight: 500; color: var(--gray-500); transition: color 0.2s; letter-spacing: 0.2px; }
    nav a:hover { color: var(--gray-900); }
    .header-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
    .header-phone { font-size: 14px; font-weight: 500; color: var(--gray-700); }
    .btn-talk { background: var(--dark); color: var(--white); padding: 10px 22px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.3px; transition: all 0.25s; white-space: nowrap; }
    .btn-talk:hover { background: var(--gold); color: var(--dark); }
    .hero { position: relative; min-height: 100vh; display: flex; align-items: center; background: var(--dark); overflow: hidden; padding-top: 80px; }
    .hero-bg { position: absolute; inset: 0; background-image: url('${heroPhotoUrl}'); background-size: cover; background-position: center; opacity: 0.18; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(105deg, var(--dark) 45%, transparent 100%); }
    .hero-inner { position: relative; z-index: 2; display: grid; grid-template-columns: 1fr 420px; gap: 60px; align-items: center; padding: 80px 0 60px; }
    .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--gold-light); border: 1px solid var(--gold-mid); color: var(--gold); padding: 7px 16px; border-radius: 50px; font-size: 12px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 28px; }
    .hero-badge::before { content: ''; width: 6px; height: 6px; background: var(--gold); border-radius: 50%; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
    .hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(38px, 4.5vw, 60px); font-weight: 700; color: var(--white); line-height: 1.12; letter-spacing: -1px; margin-bottom: 22px; }
    .hero h1 em { font-style: italic; color: var(--gold); }
    .hero-desc { font-size: 17px; color: rgba(255,255,255,0.65); max-width: 520px; margin-bottom: 40px; line-height: 1.7; }
    .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 56px; }
    .btn-primary-hero { background: var(--gold); color: var(--dark); padding: 16px 32px; border-radius: 7px; font-size: 15px; font-weight: 600; letter-spacing: 0.2px; transition: all 0.25s; display: inline-flex; align-items: center; gap: 8px; }
    .btn-primary-hero:hover { background: var(--white); transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,0.3); }
    .btn-outline-hero { background: transparent; color: var(--white); border: 1.5px solid rgba(255,255,255,0.3); padding: 16px 32px; border-radius: 7px; font-size: 15px; font-weight: 500; transition: all 0.25s; display: inline-flex; align-items: center; gap: 8px; }
    .btn-outline-hero:hover { border-color: var(--white); background: rgba(255,255,255,0.07); }
    .hero-stats { display: flex; gap: 36px; }
    .hero-stat-num { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: var(--white); line-height: 1; }
    .hero-stat-label { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.45); letter-spacing: 0.8px; text-transform: uppercase; margin-top: 4px; }
    .hero-agent-card { position: relative; background: var(--dark-3); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; }
    .hero-agent-photo { width: 100%; height: 500px; object-fit: cover; object-position: top center; }
    .hero-agent-info { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%); padding: 40px 28px 28px; }
    .hero-agent-badge { display: inline-block; background: var(--gold); color: var(--dark); font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 12px; border-radius: 4px; margin-bottom: 12px; }
    .hero-agent-name { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--white); display: block; line-height: 1.2; }
    .hero-agent-brokerage { font-size: 13px; color: rgba(255,255,255,0.55); margin-top: 4px; }
    .hero-stars { display: flex; gap: 3px; margin-top: 10px; }
    .hero-stars span { color: var(--gold); font-size: 14px; }
    .stats-banner { background: var(--dark-2); padding: 52px 0; border-top: 1px solid rgba(255,255,255,0.06); }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
    .stat-item { text-align: center; padding: 12px 24px; border-right: 1px solid rgba(255,255,255,0.08); }
    .stat-item:last-child { border-right: none; }
    .stat-num { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: var(--white); line-height: 1; }
    .stat-label { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.4); letter-spacing: 1.2px; text-transform: uppercase; margin-top: 8px; }
    .section-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: var(--gold); margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
    .section-eyebrow::after { content: ''; flex: 1; height: 1px; background: var(--gold-mid); max-width: 40px; }
    .section-title { font-family: 'Playfair Display', serif; font-size: clamp(30px, 3.5vw, 44px); font-weight: 700; color: var(--gray-900); line-height: 1.15; letter-spacing: -0.5px; }
    .section-title em { font-style: italic; color: var(--gold); }
    .properties { padding: 100px 0; background: var(--off-white); }
    .section-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 52px; }
    .view-all-link { font-size: 14px; font-weight: 600; color: var(--gold); border-bottom: 1px solid var(--gold); padding-bottom: 2px; transition: opacity 0.2s; }
    .view-all-link:hover { opacity: 0.7; }
    .prop-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
    .prop-card { background: var(--white); border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.3s; }
    .prop-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
    .prop-img-wrap { position: relative; height: 230px; overflow: hidden; }
    .prop-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .prop-card:hover .prop-img-wrap img { transform: scale(1.05); }
    .prop-tag { position: absolute; top: 16px; left: 16px; background: var(--gold); color: var(--dark); font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 5px 12px; border-radius: 4px; }
    .prop-body { padding: 24px; }
    .prop-price { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: var(--gray-900); margin-bottom: 6px; }
    .prop-address { font-size: 14px; color: var(--gray-500); margin-bottom: 16px; }
    .prop-specs { display: flex; gap: 18px; font-size: 13px; color: var(--gray-500); padding-top: 16px; border-top: 1px solid var(--gray-200); }
    .prop-spec { display: flex; align-items: center; gap: 5px; }
    .about { padding: 100px 0; }
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .about-photo-wrap { position: relative; }
    .about-photo { width: 100%; height: 580px; object-fit: cover; border-radius: 16px; object-position: top center; }
    .about-photo-badge { position: absolute; bottom: -20px; right: -20px; background: var(--dark); color: var(--white); border-radius: 14px; padding: 24px 28px; border: 2px solid rgba(255,255,255,0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    .about-badge-num { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 700; color: var(--gold); line-height: 1; }
    .about-badge-label { font-size: 13px; color: rgba(255,255,255,0.55); margin-top: 4px; }
    .about-content .section-title { margin-bottom: 10px; }
    .about-brokerage { font-size: 14px; color: var(--gold); font-weight: 500; letter-spacing: 0.5px; margin-bottom: 24px; }
    .about-text { font-size: 16px; color: var(--gray-500); line-height: 1.8; margin-bottom: 24px; }
    .about-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 36px; }
    .about-chip { background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 50px; padding: 8px 18px; font-size: 13px; font-weight: 500; color: var(--gray-700); }
    .btn-dark { display: inline-flex; align-items: center; gap: 9px; background: var(--dark); color: var(--white); padding: 16px 30px; border-radius: 8px; font-size: 15px; font-weight: 600; transition: all 0.25s; }
    .btn-dark:hover { background: var(--gold); color: var(--dark); }
    .apart { padding: 100px 0; background: var(--gray-100); }
    .apart-header { text-align: center; max-width: 580px; margin: 0 auto 60px; }
    .apart-header .section-eyebrow { justify-content: center; }
    .apart-header .section-eyebrow::after { display: none; }
    .apart-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
    .apart-card { background: var(--white); border-radius: 14px; padding: 36px 28px; border: 1px solid var(--gray-200); transition: all 0.3s; }
    .apart-card:hover { border-color: var(--gold); transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
    .apart-icon { width: 52px; height: 52px; border-radius: 12px; background: var(--dark); display: flex; align-items: center; justify-content: center; margin-bottom: 22px; }
    .apart-icon svg { color: var(--gold); }
    .apart-card h3 { font-size: 17px; font-weight: 600; color: var(--gray-900); margin-bottom: 10px; }
    .apart-card p { font-size: 14px; color: var(--gray-400); line-height: 1.7; }
    .process { padding: 100px 0; }
    .process-header { text-align: center; max-width: 600px; margin: 0 auto 64px; }
    .process-header .section-eyebrow { justify-content: center; }
    .process-header .section-eyebrow::after { display: none; }
    .process-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; position: relative; }
    .process-steps::before { content: ''; position: absolute; top: 36px; left: calc(16.66% + 20px); right: calc(16.66% + 20px); height: 1px; background: var(--gray-200); }
    .process-step { text-align: center; }
    .step-num { width: 72px; height: 72px; border-radius: 50%; background: var(--dark); color: var(--white); font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 28px; position: relative; z-index: 1; border: 3px solid transparent; transition: all 0.3s; }
    .process-step:hover .step-num { background: var(--gold); color: var(--dark); border-color: var(--gold); }
    .process-step h3 { font-size: 18px; font-weight: 600; color: var(--gray-900); margin-bottom: 10px; }
    .process-step p { font-size: 15px; color: var(--gray-400); line-height: 1.7; }
    .reviews { padding: 100px 0; background: var(--dark); }
    .reviews-header { text-align: center; max-width: 600px; margin: 0 auto 20px; }
    .reviews .section-eyebrow { color: var(--gold); justify-content: center; }
    .reviews .section-eyebrow::after { display: none; }
    .reviews .section-title { color: var(--white); }
    .reviews-rating { display: flex; justify-content: center; align-items: center; gap: 10px; margin: 16px 0 56px; }
    .reviews-stars { display: flex; gap: 4px; }
    .reviews-stars span { color: var(--gold); font-size: 20px; }
    .reviews-rating-text { font-size: 15px; color: rgba(255,255,255,0.5); }
    .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .review-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; transition: all 0.3s; }
    .review-card:hover { border-color: var(--gold-mid); background: rgba(255,255,255,0.07); }
    .review-quote { color: var(--gold); font-size: 40px; font-family: 'Playfair Display', serif; line-height: 1; margin-bottom: 16px; }
    .review-text { font-size: 15px; color: rgba(255,255,255,0.65); line-height: 1.8; margin-bottom: 24px; font-style: italic; }
    .review-author { display: flex; align-items: center; gap: 14px; }
    .review-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: var(--dark); flex-shrink: 0; }
    .review-name { font-size: 15px; font-weight: 600; color: var(--white); }
    .review-type { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 2px; }
    .neighborhoods { padding: 100px 0; background: var(--off-white); }
    .neighborhoods-header { text-align: center; max-width: 600px; margin: 0 auto 56px; }
    .neighborhoods-header .section-eyebrow { justify-content: center; }
    .neighborhoods-header .section-eyebrow::after { display: none; }
    .neighborhoods-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .neighborhood-card { position: relative; height: 200px; border-radius: 14px; overflow: hidden; cursor: pointer; transition: all 0.35s; background-size: cover; background-position: center; }
    .neighborhood-card:hover { transform: scale(1.02); }
    .neighborhood-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 24px; transition: all 0.3s; }
    .neighborhood-card:hover .neighborhood-overlay { background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%); }
    .neighborhood-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--white); }
    .neighborhood-price { font-size: 13px; color: var(--gold); margin-top: 4px; font-weight: 500; }
    .instagram { padding: 80px 0; background: var(--white); }
    .instagram-header { text-align: center; margin-bottom: 40px; }
    .ig-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-bottom: 32px; }
    .ig-item { position: relative; aspect-ratio: 1; overflow: hidden; cursor: pointer; }
    .ig-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .ig-item:hover img { transform: scale(1.08); }
    .ig-item-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); opacity: 0; transition: opacity 0.3s; display: flex; align-items: center; justify-content: center; }
    .ig-item:hover .ig-item-overlay { opacity: 1; }
    .alerts { padding: 80px 0; background: var(--dark-3); }
    .alerts-inner { max-width: 700px; margin: 0 auto; text-align: center; }
    .alerts .section-title { color: var(--white); margin-bottom: 10px; }
    .alerts-sub { font-size: 16px; color: rgba(255,255,255,0.5); margin-bottom: 36px; }
    .alerts-form { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .form-select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); padding: 14px 16px; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; cursor: pointer; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23C9A96E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; transition: border-color 0.2s; }
    .form-select:focus { border-color: var(--gold); }
    .form-select option { background: var(--dark-2); color: var(--white); }
    .btn-alert { grid-column: 1 / -1; background: var(--gold); color: var(--dark); padding: 16px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; border: none; font-family: inherit; transition: all 0.25s; letter-spacing: 0.3px; }
    .btn-alert:hover { background: var(--white); }
    .alerts-note { font-size: 12px; color: rgba(255,255,255,0.3); }
    .cta-section { padding: 100px 0; background: linear-gradient(135deg, var(--dark) 0%, var(--dark-2) 100%); text-align: center; position: relative; overflow: hidden; }
    .cta-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 120%, ${goldColor}20 0%, transparent 60%); }
    .cta-section .section-title { color: var(--white); margin-bottom: 18px; position: relative; }
    .cta-sub { font-size: 17px; color: rgba(255,255,255,0.5); max-width: 540px; margin: 0 auto 44px; position: relative; }
    .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; }
    .btn-cta-primary { background: var(--gold); color: var(--dark); padding: 18px 40px; border-radius: 8px; font-size: 15px; font-weight: 700; transition: all 0.25s; }
    .btn-cta-primary:hover { background: var(--white); transform: translateY(-2px); }
    .btn-cta-outline { background: transparent; color: var(--white); border: 1.5px solid rgba(255,255,255,0.25); padding: 18px 40px; border-radius: 8px; font-size: 15px; font-weight: 500; transition: all 0.25s; }
    .btn-cta-outline:hover { border-color: var(--white); background: rgba(255,255,255,0.05); }
    footer { background: var(--dark); border-top: 1px solid rgba(255,255,255,0.06); padding: 60px 0 36px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 52px; }
    .footer-brand .logo-name { color: var(--white); font-size: 22px; }
    .footer-brand .logo-sub { color: var(--gold); }
    .footer-brand-desc { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.8; margin-top: 16px; max-width: 280px; }
    .footer-col h4 { font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 20px; }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .footer-col ul li a { font-size: 14px; color: rgba(255,255,255,0.55); transition: color 0.2s; }
    .footer-col ul li a:hover { color: var(--gold); }
    .footer-contact-item { font-size: 14px; color: rgba(255,255,255,0.55); margin-bottom: 8px; }
    .footer-contact-item a:hover { color: var(--gold); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .footer-copy { font-size: 13px; color: rgba(255,255,255,0.25); }
    .footer-legal { font-size: 12px; color: rgba(255,255,255,0.2); max-width: 500px; text-align: right; }
    @media (max-width: 1024px) { .hero-inner { grid-template-columns: 1fr; } .hero-agent-card { display: none; } .about-grid { grid-template-columns: 1fr; gap: 50px; } .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; } .apart-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { nav { display: none; } .header-phone { display: none; } .prop-grid, .reviews-grid, .neighborhoods-grid, .process-steps { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: repeat(2, 1fr); } .ig-grid { grid-template-columns: repeat(3, 1fr); } .apart-grid { grid-template-columns: 1fr; } .alerts-form { grid-template-columns: 1fr; } .footer-grid { grid-template-columns: 1fr; gap: 32px; } .footer-legal { text-align: left; } }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-inner">
        <a href="index.html" class="logo-wrap">
          <span class="logo-name">${companyName}</span>
          <span class="logo-sub">Real Estate</span>
        </a>
        <nav>
          <a href="index.html">Home</a>
          <a href="index.html#about">About</a>
          <a href="listings.html">Listings</a>
          <a href="index.html#reviews">Reviews</a>
          <a href="index.html#neighborhoods">Areas</a>
          <a href="blog.html">Blog</a>
          <a href="resources.html">Resources</a>
          <a href="index.html#contact">Contact</a>
        </nav>
        <div class="header-right">
          <a href="tel:${phone}" class="header-phone">${phone}</a>
          <a href="index.html#contact" class="btn-talk">Let's Talk</a>
        </div>
      </div>
    </div>
  </header>

  <section class="hero">
    <div class="hero-bg"></div>
    <div class="hero-overlay"></div>
    <div class="container" style="width:100%">
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-badge">Greater ${city}'s Trusted Realtor</div>
          <h1>${heroTitle.includes('.') ? heroTitle.split('.').map((p, i) => i === 1 ? `<em>${p}.</em>` : p + (i < heroTitle.split('.').length - 1 ? '.' : '')).join('') : heroTitle}</h1>
          <p class="hero-desc">${heroSubtitle}</p>
          <div class="hero-actions">
            <a href="#services" class="btn-primary-hero">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              Explore Properties
            </a>
            <a href="#contact" class="btn-outline-hero">Get Your Home's Value</a>
          </div>
          <div class="hero-stats">
            <div class="hero-stat-item">
              <div class="hero-stat-num">${homesSOLD}</div>
              <div class="hero-stat-label">Homes Sold</div>
            </div>
            <div class="hero-stat-item">
              <div class="hero-stat-num">${teamRank}</div>
              <div class="hero-stat-label">Team in ${province}</div>
            </div>
            <div class="hero-stat-item">
              <div class="hero-stat-num">${rating}</div>
              <div class="hero-stat-label">Star Rating</div>
            </div>
          </div>
        </div>
        <div class="hero-agent-card">
          <img src="${agentPhotoUrl}" alt="${companyName}" class="hero-agent-photo">
          <div class="hero-agent-info">
            <div class="hero-agent-badge">${teamRank} Team in ${province}</div>
            <span class="hero-agent-name">${companyName}</span>
            <div class="hero-agent-brokerage">${brokerageName}</div>
            <div class="hero-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="stats-banner">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-num">${homesSOLD}</div>
          <div class="stat-label">Homes Sold</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">${yearsExp}</div>
          <div class="stat-label">Years Experience</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">${rating}</div>
          <div class="stat-label">Star Rating</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">${province}</div>
          <div class="stat-label">Province</div>
        </div>
      </div>
    </div>
  </section>

  <section class="properties" id="listings">
    <div class="container">
      <div class="section-head">
        <div>
          <div class="section-eyebrow">Featured Properties</div>
          <h2 class="section-title">Find Your <em>Dream Home</em></h2>
        </div>
        <a href="listings.html" class="view-all-link">View All Properties →</a>
      </div>
      <div class="prop-grid">
        ${propertyImages.map((img, i) => `
        <div class="prop-card">
          <div class="prop-img-wrap">
            <img src="${img}" alt="Property ${i+1}" loading="lazy">
            <span class="prop-tag">For Sale</span>
          </div>
          <div class="prop-body">
            <div class="prop-price">${i === 0 ? '$2,450,000' : i === 1 ? '$1,850,000' : '$975,000'}</div>
            <div class="prop-address">${i === 0 ? '100 King St W, Vancouver' : i === 1 ? '45 Maple Ave, North Vancouver' : '88 Oak Street, Surrey'}</div>
            <div class="prop-specs">
              <span class="prop-spec"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3"/></svg> ${i === 0 ? '3' : i === 1 ? '5' : '3'} Beds</span>
              <span class="prop-spec"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg> ${i === 0 ? '3' : i === 1 ? '4' : '2'} Baths</span>
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section class="about" id="about">
    <div class="container">
      <div class="about-grid">
        <div class="about-photo-wrap">
          <img src="${agentPhotoUrl}" alt="${companyName}" class="about-photo">
          <div class="about-photo-badge">
            <div class="about-badge-num">${homesSOLD}</div>
            <div class="about-badge-label">Homes Sold</div>
          </div>
        </div>
        <div class="about-content">
          <div class="section-eyebrow">Meet Your Realtor</div>
          <h2 class="section-title">${companyName}</h2>
          <div class="about-brokerage">${brokerageName}</div>
          <p class="about-text">${about}</p>
          <div class="about-chips">
            ${servicesList.map(s => `<span class="about-chip">${s}</span>`).join('')}
          </div>
          <a href="#contact" class="btn-dark">
            Get in Touch
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
      </div>
    </div>
  </section>

  <section class="apart" id="services">
    <div class="container">
      <div class="apart-header">
        <div class="section-eyebrow">Get to Know Me</div>
        <h2 class="section-title">See What Sets Me <em>Apart</em></h2>
      </div>
      <div class="apart-grid">
        <div class="apart-card">
          <div class="apart-icon"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
          <h3>Available 7 Days a Week</h3>
          <p>Anytime, evenings and weekends included</p>
        </div>
        <div class="apart-card">
          <div class="apart-icon"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg></div>
          <h3>Same-Day Communication</h3>
          <p>Questions answered fast, every time</p>
        </div>
        <div class="apart-card">
          <div class="apart-icon"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
          <h3>No-Pressure Guidance</h3>
          <p>Your pace, your decision, always</p>
        </div>
        <div class="apart-card">
          <div class="apart-icon"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></div>
          <h3>Expert Negotiator</h3>
          <p>Fighting for the best deal on your behalf</p>
        </div>
      </div>
    </div>
  </section>

  <section class="process">
    <div class="container">
      <div class="process-header">
        <div class="section-eyebrow">How I Work With You</div>
        <h2 class="section-title">The <em>Process</em></h2>
      </div>
      <div class="process-steps">
        <div class="process-step">
          <div class="step-num">01</div>
          <h3>Free Strategy Call</h3>
          <p>We align on your goals, timeline, and must-haves. No obligation.</p>
        </div>
        <div class="process-step">
          <div class="step-num">02</div>
          <h3>Personalized Plan</h3>
          <p>A tailored market strategy built around you, not a template.</p>
        </div>
        <div class="process-step">
          <div class="step-num">03</div>
          <h3>Guided to Close</h3>
          <p>Every detail handled: offers, negotiations, and paperwork, start to finish.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="reviews" id="reviews">
    <div class="container">
      <div class="reviews-header">
        <div class="section-eyebrow">Google Reviews</div>
        <h2 class="section-title">Client <em>Testimonials</em></h2>
        <div class="reviews-rating">
          <div class="reviews-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <span class="reviews-rating-text">${rating} based on ${homesSOLD} verified reviews</span>
        </div>
      </div>
      <div class="reviews-grid">
        ${reviews.filter(r => r.name).map(r => `
        <div class="review-card">
          <div class="review-quote">"</div>
          <p class="review-text">${r.text}</p>
          <div class="review-author">
            <div class="review-avatar">${r.name.charAt(0)}</div>
            <div>
              <div class="review-name">${r.name}</div>
              <div class="review-type">${r.type}</div>
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section class="neighborhoods" id="neighborhoods">
    <div class="container">
      <div class="neighborhoods-header">
        <div class="section-eyebrow">Explore the Area</div>
        <h2 class="section-title">Greater ${city} <em>Neighborhoods</em></h2>
        <p style="font-size:16px;color:var(--gray-400);margin-top:14px;">Discover the unique character of each neighborhood and find the community that feels like home.</p>
      </div>
      <div class="neighborhoods-grid">
        ${neighborhoods.map(n => `
        <div class="neighborhood-card" style="background-image: url('${n.image}')">
          <div class="neighborhood-overlay">
            <div class="neighborhood-name">${n.name}</div>
            <div class="neighborhood-price">From ${n.price}</div>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  ${instagramHandle ? `
  <section class="instagram">
    <div class="container">
      <div class="instagram-header">
        <div class="section-eyebrow" style="justify-content:center;margin-bottom:8px;">Follow Along</div>
        <h2 class="section-title" style="text-align:center;">On <em>Instagram</em></h2>
        <p style="text-align:center;font-size:15px;color:var(--gray-400);margin-top:10px;">Real listings. Real results. See what's happening in ${city} real estate.</p>
      </div>
      <div class="ig-grid">
        ${igImages.map((img, i) => `
        <a class="ig-item" href="https://instagram.com/${instagramHandle.replace('@','')}" target="_blank" rel="noopener">
          <img src="${img}" alt="Instagram ${i+1}" loading="lazy">
          <div class="ig-item-overlay">
            <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </div>
        </a>
        `).join('')}
      </div>
      <div class="instagram-cta">
        <a href="https://instagram.com/${instagramHandle.replace('@','')}" target="_blank" rel="noopener" class="btn-ig">
          Follow @${instagramHandle.replace('@','')}
        </a>
      </div>
    </div>
  </section>
  ` : ''}

  <section class="alerts" id="resources">
    <div class="container">
      <div class="alerts-inner">
        <h2 class="section-title">Get New Listing Alerts</h2>
        <p class="alerts-sub">Be the first to know when properties matching your criteria hit the market. Unsubscribe anytime.</p>
        <form class="alerts-form" onsubmit="event.preventDefault(); alert('Thank you! You will receive listing alerts soon.');">
          <select class="form-select">
            <option>Preferred Area</option>
            <option>Vancouver West</option>
            <option>East Vancouver</option>
            <option>Burnaby</option>
            <option>Surrey</option>
          </select>
          <select class="form-select">
            <option>Price Range</option>
            <option>Under $500K</option>
            <option>$500K - $750K</option>
            <option>$750K - $1M</option>
            <option>$1M - $1.5M</option>
            <option>$1.5M - $2M</option>
            <option>$2M+</option>
          </select>
          <select class="form-select">
            <option>Property Type</option>
            <option>House</option>
            <option>Condo</option>
            <option>Townhouse</option>
            <option>Duplex</option>
          </select>
          <button type="submit" class="btn-alert">Start Alerts</button>
        </form>
        <p class="alerts-note">By subscribing, you agree to receive marketing communications.</p>
      </div>
    </div>
  </section>

  <section class="cta-section" id="contact">
    <div class="container">
      <h2 class="section-title">Ready to Take the Next Step?</h2>
      <p class="cta-sub">Let's find your perfect home. Whether you're buying, selling, or just exploring - I'm here to help.</p>
      <div class="cta-btns">
        <a href="tel:${phone}" class="btn-cta-primary">Call ${phone}</a>
        <a href="mailto:${email}" class="btn-cta-outline">Email Me</a>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo-wrap">
            <span class="logo-name">${companyName}</span>
            <span class="logo-sub">Real Estate</span>
          </div>
          <p class="footer-brand-desc">Helping families find their perfect home in Greater ${city}. Your trusted partner for buying, selling, and investing in the ${provFull} market.</p>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="index.html#about">About</a></li>
            <li><a href="listings.html">Listings</a></li>
            <li><a href="index.html#reviews">Reviews</a></li>
            <li><a href="index.html#neighborhoods">Areas</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="index.html#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="resources.html">Buyer's Guide</a></li>
            <li><a href="resources.html">Seller's Guide</a></li>
            <li><a href="resources.html">Market Reports</a></li>
            <li><a href="resources.html">Open Houses</a></li>
            <li><a href="resources.html">FAQ</a></li>
            <li><a href="resources.html">Mortgage Calculator</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Get in Touch</h4>
          <div class="footer-contact-item"><a href="tel:${phone}">${phone}</a></div>
          <div class="footer-contact-item"><a href="mailto:${email}">${email}</a></div>
          <div class="footer-contact-item">${city}, ${province}, Canada</div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p class="footer-legal">The trademarks REALTOR®, REALTORS®, and the REALTOR® logo are controlled by The Canadian Real Estate Association (CREA).</p>
      </div>
    </div>
  </footer>
</body>

  <!-- Chat Widget -->
  <div id="chat-widget">
    <button id="chat-toggle" onclick="toggleChat()">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    </button>
    <div id="chat-window">
      <div class="chat-header">
        <span>Chat with us</span>
        <button onclick="toggleChat()" style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;">×</button>
      </div>
      <div id="chat-messages"></div>
      <div class="chat-input">
        <input type="text" id="chat-input" placeholder="Type a message..." onkeypress="if(event.key==='Enter')sendMessage()">
        <button onclick="sendMessage()">Send</button>
      </div>
    </div>
  </div>

  <style>
    #chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: 'DM Sans', sans-serif; }
    #chat-toggle { width: 56px; height: 56px; border-radius: 50%; background: #C9A96E; border: none; color: #0a0a0f; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.25); transition: transform 0.2s; }
    #chat-toggle:hover { transform: scale(1.05); }
    #chat-window { display: none; position: absolute; bottom: 70px; right: 0; width: 360px; height: 480px; background: #1c1c26; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); flex-direction: column; overflow: hidden; }
    #chat-window.open { display: flex; }
    .chat-header { background: #C9A96E; color: #0a0a0f; padding: 16px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
    #chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .chat-msg { padding: 12px 16px; border-radius: 12px; max-width: 85%; font-size: 14px; line-height: 1.5; }
    .chat-msg.user { background: #C9A96E; color: #0a0a0f; align-self: flex-end; border-bottom-right-radius: 4px; }
    .chat-msg.bot { background: #2a2a35; color: #fff; align-self: flex-start; border-bottom-left-radius: 4px; }
    .chat-msg.thinking { color: #9d9b95; font-style: italic; }
    .chat-input { padding: 12px; background: #13131a; display: flex; gap: 8px; border-top: 1px solid #2a2a35; }
    .chat-input input { flex: 1; padding: 10px 14px; border-radius: 8px; border: 1px solid #2a2a35; background: #1c1c26; color: #fff; font-size: 14px; }
    .chat-input input::placeholder { color: #6b6963; }
    .chat-input input:focus { outline: none; border-color: #C9A96E; }
    .chat-input button { padding: 10px 16px; border-radius: 8px; background: #C9A96E; color: #0a0a0f; border: none; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .chat-input button:hover { background: #b89a5e; }
    @media (max-width: 480px) { #chat-window { width: calc(100vw - 48px); right: -8px; } }
  </style>

  <script>
    const agentName = "${companyName}";
    const agentCity = "${city}";
    const agentProvince = "${province}";
    const agentPhone = "${phone}";
    const agentEmail = "${email}";
    const agentServices = "Home Buying, Home Selling, Investment Properties";
    const systemPrompt = "You are " + agentName + ", a real estate agent in " + agentCity + ", " + agentProvince + ". You help people buy and sell homes. Your services: " + agentServices + ". Keep replies short (1-2 sentences). Be professional and friendly. Suggest properties when relevant. Try to convert users into leads. Offer viewing appointments. Contact: " + agentPhone + ", " + agentEmail;
    const openRouterApiKey = "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";
    
    const messagesDiv = document.getElementById('chat-messages');
    
    function toggleChat() {
      document.getElementById('chat-window').classList.toggle('open');
    }
    
    function addMessage(text, isUser) {
      const div = document.createElement('div');
      div.className = 'chat-msg ' + (isUser ? 'user' : 'bot');
      div.textContent = text;
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      return div;
    }
    
    async function sendMessage() {
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text) return;
      
      addMessage(text, true);
      input.value = '';
      
      const thinking = addMessage('Thinking...', false);
      thinking.classList.add('thinking');
      
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + openRouterApiKey, 'Content-Type': 'application/json', 'HTTP-Referer': window.location.href, 'X-Title': 'Real Estate Chatbot' },
          body: JSON.stringify({ model: 'stepfun/step-3.5-flash:free', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: text }], temperature: 0.7, max_tokens: 150 })
        });
        const data = await res.json();
        thinking.remove();
        if (data?.choices?.[0]?.message?.content) {
          addMessage(data.choices[0].message.content.trim(), false);
        } else {
          addMessage('No response. Please try again.', false);
        }
      } catch (err) {
        thinking.remove();
        addMessage('Error: ' + err.message, false);
      }
    }
    
    document.getElementById('chat-window').classList.add('open');
    setTimeout(() => { document.getElementById('chat-window').classList.remove('open'); }, 3000);

    // Quick Connection Popup
    let popupShown = false;
    let userInteracted = false;
    let interactionTimer = null;

    function triggerPopup() {
      if (popupShown) return;
      popupShown = true;
      document.getElementById('quickPopup').classList.add('active');
      document.getElementById('quickPopupOverlay').classList.add('active');
    }

    function showStep2() {
      const name = document.getElementById('qcName').value.trim();
      const email = document.getElementById('qcEmail').value.trim();
      const phone = document.getElementById('qcPhone').value.trim();
      const consent = document.getElementById('qcConsent').checked;

      if (!name || !email || !phone) {
        alert('Please fill in all required fields.');
        return;
      }
      if (!consent) {
        alert('Please agree to the consent checkbox to continue.');
        return;
      }

      document.getElementById('qcStep1').style.display = 'none';
      document.getElementById('qcStep2').style.display = 'block';
    }

    function submitQuickLead() {
      const firstTime = document.querySelector('input[name="firstTime"]:checked');
      const buyTimeline = document.querySelector('input[name="buyTimeline"]:checked');
      const preQualified = document.querySelector('input[name="preQualified"]:checked');
      const hasHouse = document.querySelector('input[name="hasHouse"]:checked');
      const hasAgent = document.querySelector('input[name="hasAgent"]:checked');

      if (!firstTime || !buyTimeline || !preQualified || !hasHouse || !hasAgent) {
        alert('Please answer all questions.');
        return;
      }

      const leadData = {
        name: document.getElementById('qcName').value.trim(),
        email: document.getElementById('qcEmail').value.trim(),
        phone: document.getElementById('qcPhone').value.trim(),
        consent: true,
        firstTimeBuyer: firstTime.value === 'yes',
        buyTimeline: buyTimeline.value,
        preQualified: preQualified.value === 'yes',
        hasHouseToSell: hasHouse.value === 'yes',
        hasAgent: hasAgent.value === 'yes',
        timestamp: new Date().toISOString()
      };

      console.log('Lead submitted:', leadData);
      alert('Thank you! Your information has been submitted. An agent will contact you shortly.');
      closeQuickPopup();
    }

    function closeQuickPopup() {
      document.getElementById('quickPopup').classList.remove('active');
      document.getElementById('quickPopupOverlay').classList.remove('active');
      document.getElementById('showNowBtn').style.display = 'none';
    }

    function resetQuickPopup() {
      document.getElementById('qcStep1').style.display = 'block';
      document.getElementById('qcStep2').style.display = 'none';
      document.getElementById('qcName').value = '';
      document.getElementById('qcEmail').value = '';
      document.getElementById('qcPhone').value = '';
      document.getElementById('qcConsent').checked = false;
      document.querySelectorAll('input[name="firstTime"], input[name="buyTimeline"], input[name="preQualified"], input[name="hasHouse"], input[name="hasAgent"]').forEach(r => r.checked = false);
    }

    document.addEventListener('mousemove', startPopupTimer);
    document.addEventListener('scroll', startPopupTimer);
    document.addEventListener('click', startPopupTimer);
    document.addEventListener('keypress', startPopupTimer);

    function startPopupTimer() {
      if (userInteracted || popupShown) return;
      userInteracted = true;
      interactionTimer = setTimeout(triggerPopup, 10000);
    }

    document.getElementById('quickPopupOverlay').addEventListener('click', closeQuickPopup);
  </script>

  <!-- Quick Connection Popup -->
  <div id="quickPopupOverlay"></div>
  <div id="quickPopup" class="qc-popup">
    <button class="qc-close" onclick="closeQuickPopup()">×</button>
    
    <!-- Step 1: Basic Info -->
    <div id="qcStep1">
      <div class="qc-header">
        <h3>Quick Connection</h3>
        <p>Connect with ${companyName} today!</p>
      </div>
      
      <div class="qc-form">
        <div class="qc-field">
          <label for="qcName">Name *</label>
          <input type="text" id="qcName" placeholder="Your full name" required>
        </div>
        
        <div class="qc-field">
          <label for="qcEmail">Email *</label>
          <input type="email" id="qcEmail" placeholder="your.email@example.com" required>
        </div>
        
        <div class="qc-field">
          <label for="qcPhone">Phone Number *</label>
          <input type="tel" id="qcPhone" placeholder="(604) 555-1234" required>
        </div>
        
        <div class="qc-consent">
          <input type="checkbox" id="qcConsent">
          <label for="qcConsent">
            By checking this box, I agree by electronic signature to the Electronic Disclosure Consent Agreement; to receive recurring marketing communication from or on behalf of ${companyName}, including auto-dialed calls, texts, and artificial/prerecorded voice messages (message frequency varies; data rates may apply; reply "STOP" to opt-out of texts or "HELP" for assistance); and to the Terms of Service and Privacy Policy of this website. Consent not required to make a purchase. I understand that I can call <a href="tel:${phone}">${phone}</a> to obtain direct assistance.
          </label>
        </div>
        
        <button class="qc-btn qc-btn-primary" onclick="showStep2()">Continue</button>
      </div>
    </div>
    
    <!-- Step 2: Buyer Profile -->
    <div id="qcStep2" style="display: none;">
      <div class="qc-header">
        <h3>Almost There!</h3>
        <p>Help us serve you better</p>
      </div>
      
      <div class="qc-form">
        <div class="qc-field">
          <label>Are you a first time home buyer? *</label>
          <div class="qc-radio-group">
            <label class="qc-radio"><input type="radio" name="firstTime" value="yes"> Yes</label>
            <label class="qc-radio"><input type="radio" name="firstTime" value="no"> No</label>
          </div>
        </div>
        
        <div class="qc-field">
          <label>Within how many months do you plan to buy a home? *</label>
          <div class="qc-radio-options">
            <label class="qc-radio-opt"><input type="radio" name="buyTimeline" value="0-1"> 0-1</label>
            <label class="qc-radio-opt"><input type="radio" name="buyTimeline" value="1-3"> 1-3</label>
            <label class="qc-radio-opt"><input type="radio" name="buyTimeline" value="3-6"> 3-6</label>
            <label class="qc-radio-opt"><input type="radio" name="buyTimeline" value="6-12"> 6-12</label>
            <label class="qc-radio-opt"><input type="radio" name="buyTimeline" value="12+"> 12+</label>
          </div>
        </div>
        
        <div class="qc-field">
          <label>Have you been pre-qualified for a mortgage? *</label>
          <div class="qc-radio-group">
            <label class="qc-radio"><input type="radio" name="preQualified" value="yes"> Yes</label>
            <label class="qc-radio"><input type="radio" name="preQualified" value="no"> No</label>
          </div>
        </div>
        
        <div class="qc-field">
          <label>Do you have a house to sell first? *</label>
          <div class="qc-radio-group">
            <label class="qc-radio"><input type="radio" name="hasHouse" value="yes"> Yes</label>
            <label class="qc-radio"><input type="radio" name="hasHouse" value="no"> No</label>
          </div>
        </div>
        
        <div class="qc-field">
          <label>Do you have an agent already? *</label>
          <div class="qc-radio-group">
            <label class="qc-radio"><input type="radio" name="hasAgent" value="yes"> Yes</label>
            <label class="qc-radio"><input type="radio" name="hasAgent" value="no"> No</label>
          </div>
        </div>
        
        <button class="qc-btn qc-btn-primary" onclick="submitQuickLead()">Submit</button>
        <button class="qc-btn qc-btn-secondary" onclick="document.getElementById('qcStep2').style.display='none'; document.getElementById('qcStep1').style.display='block';">Back</button>
      </div>
    </div>
  </div>

  <!-- Show Now Button -->
  <button id="showNowBtn" class="show-now-btn" onclick="triggerPopup()">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    Quick Connect
  </button>

  <style>
    #quickPopupOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9998; display: none; }
    #quickPopupOverlay.active { display: block; }
    
    .qc-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); background: #fff; border-radius: 16px; padding: 32px; max-width: 480px; width: calc(100% - 32px); max-height: 90vh; overflow-y: auto; z-index: 9999; display: none; opacity: 0; transition: all 0.3s ease; }
    .qc-popup.active { display: block; opacity: 1; transform: translate(-50%, -50%) scale(1); }
    
    .qc-close { position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 28px; cursor: pointer; color: #9d9b95; line-height: 1; }
    .qc-close:hover { color: #333; }
    
    .qc-header { text-align: center; margin-bottom: 24px; }
    .qc-header h3 { font-family: 'Playfair Display', serif; font-size: 26px; color: #1a1917; margin-bottom: 8px; }
    .qc-header p { color: #6b6963; font-size: 14px; }
    
    .qc-form { display: flex; flex-direction: column; gap: 16px; }
    
    .qc-field label { display: block; font-size: 14px; font-weight: 500; color: #3a3935; margin-bottom: 6px; }
    .qc-field input[type="text"],
    .qc-field input[type="email"],
    .qc-field input[type="tel"] { width: 100%; padding: 12px 14px; border: 1px solid #e8e6e1; border-radius: 8px; font-size: 15px; transition: border-color 0.2s; }
    .qc-field input:focus { outline: none; border-color: #C9A96E; }
    
    .qc-consent { display: flex; gap: 12px; align-items: flex-start; background: #f9f8f6; padding: 14px; border-radius: 8px; }
    .qc-consent input[type="checkbox"] { margin-top: 3px; flex-shrink: 0; width: 18px; height: 18px; accent-color: #C9A96E; }
    .qc-consent label { font-size: 11px; line-height: 1.5; color: #6b6963; }
    .qc-consent a { color: #C9A96E; text-decoration: none; }
    .qc-consent a:hover { text-decoration: underline; }
    
    .qc-radio-group { display: flex; gap: 20px; }
    .qc-radio { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: #3a3935; }
    .qc-radio input { accent-color: #C9A96E; width: 18px; height: 18px; }
    
    .qc-radio-options { display: flex; flex-wrap: wrap; gap: 8px; }
    .qc-radio-opt { display: flex; align-items: center; justify-content: center; padding: 8px 14px; border: 1px solid #e8e6e1; border-radius: 6px; cursor: pointer; font-size: 13px; color: #3a3935; transition: all 0.2s; }
    .qc-radio-opt:hover { border-color: #C9A96E; }
    .qc-radio-opt:has(input:checked) { background: #C9A96E; border-color: #C9A96E; color: #0a0a0f; }
    .qc-radio-opt input { display: none; }
    
    .qc-btn { width: 100%; padding: 14px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
    .qc-btn-primary { background: #C9A96E; color: #0a0a0f; }
    .qc-btn-primary:hover { background: #b89a5e; }
    .qc-btn-secondary { background: transparent; color: #6b6963; border: 1px solid #e8e6e1; margin-top: 8px; }
    .qc-btn-secondary:hover { background: #f4f3f0; }
    
    .show-now-btn { position: fixed; bottom: 90px; right: 24px; z-index: 9997; background: #0a0a0f; color: #C9A96E; border: none; padding: 12px 18px; border-radius: 50px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: all 0.2s; }
    .show-now-btn:hover { background: #1c1c26; transform: scale(1.05); }
    
    @media (max-width: 480px) {
      .qc-popup { padding: 24px 20px; border-radius: 12px; }
      .qc-header h3 { font-size: 22px; }
      .qc-radio-options { gap: 6px; }
      .qc-radio-opt { padding: 6px 10px; font-size: 12px; }
      .show-now-btn { bottom: 80px; right: 16px; }
    }
  </style>
</html>`;
}

function generateListingsPage(details: Record<string, string>): string {
  const { companyName = 'Real Estate', city = 'Toronto', province = 'ON', phone = '(604) 555-0192', email = 'hello@realestate.com' } = details;
  const provinceName: Record<string, string> = { ON: 'Ontario', BC: 'British Columbia', AB: 'Alberta', QC: 'Quebec' };
  const provFull = provinceName[province] || province;

  const listings = [
    { title: 'Luxury Downtown Penthouse', price: '$2,450,000', beds: 3, baths: 3, sqft: '2,800', address: '100 King St W, Toronto', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', type: 'Condo' },
    { title: 'Modern Family Home', price: '$1,850,000', beds: 5, baths: 4, sqft: '3,200', address: '45 Maple Avenue, North York', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', type: 'House' },
    { title: 'Cozy Townhouse', price: '$975,000', beds: 3, baths: 2, sqft: '1,650', address: '88 Oak Street, Scarborough', image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', type: 'Townhouse' },
    { title: 'Waterfront Condo', price: '$1,250,000', beds: 2, baths: 2, sqft: '1,400', address: '220 Lakeshore Blvd, Toronto', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', type: 'Condo' },
    { title: 'Executive Estate', price: '$3,200,000', beds: 6, baths: 5, sqft: '4,500', address: '15 Park Lane, Richmond Hill', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', type: 'House' },
    { title: 'Starter Home', price: '$725,000', beds: 2, baths: 1, sqft: '950', address: '67 Cedar Road, Mississauga', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', type: 'House' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Listings | ${companyName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --gold: #C9A96E; --gold-light: #C9A96E33; --gold-mid: #C9A96E88; --dark: #0a0a0f; --dark-2: #13131a; --dark-3: #1c1c26; --white: #ffffff; --off-white: #faf9f7; --gray-100: #f4f3f0; --gray-200: #e8e6e1; --gray-400: #9d9b95; --gray-500: #6b6963; --gray-700: #3a3935; --gray-900: #1a1917; }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; color: var(--gray-700); background: var(--white); line-height: 1.65; overflow-x: hidden; }
    a { text-decoration: none; color: inherit; }
    img { max-width: 100%; display: block; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
    header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--gray-200); transition: all 0.3s ease; }
    .header-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; gap: 24px; }
    .logo-wrap { display: flex; flex-direction: column; }
    .logo-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--gray-900); letter-spacing: -0.3px; line-height: 1; }
    .logo-sub { font-size: 11px; font-weight: 400; color: var(--gold); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; }
    nav { display: flex; align-items: center; gap: 28px; }
    nav a { font-size: 14px; font-weight: 500; color: var(--gray-500); transition: color 0.2s; letter-spacing: 0.2px; }
    nav a:hover { color: var(--gray-900); }
    .header-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
    .header-phone { font-size: 14px; font-weight: 500; color: var(--gray-700); }
    .btn-talk { background: var(--dark); color: var(--white); padding: 10px 22px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.3px; transition: all 0.25s; white-space: nowrap; }
    .btn-talk:hover { background: var(--gold); color: var(--dark); }
    .page-hero { background: var(--dark); padding: 140px 0 80px; text-align: center; position: relative; overflow: hidden; }
    .page-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, var(--gold) 0%, transparent 70%); opacity: 0.1; }
    .page-hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(36px, 5vw, 56px); font-weight: 700; color: var(--white); line-height: 1.12; letter-spacing: -1px; margin-bottom: 18px; position: relative; }
    .page-hero p { font-size: 17px; color: rgba(255,255,255,0.6); max-width: 540px; margin: 0 auto; position: relative; }
    .filters { background: var(--gray-100); padding: 24px 0; border-bottom: 1px solid var(--gray-200); }
    .filters-inner { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
    .filters select { padding: 12px 16px; border: 1px solid var(--gray-200); border-radius: 8px; font-size: 14px; min-width: 160px; background: white; font-family: inherit; cursor: pointer; }
    .filters .count { font-size: 14px; color: var(--gray-500); margin-left: auto; }
    .listings-section { padding: 64px 0; }
    .section-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 3vw, 36px); font-weight: 700; color: var(--gray-900); margin-bottom: 40px; }
    .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px; }
    .listing-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: 14px; overflow: hidden; transition: all 0.3s; }
    .listing-card:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.1); border-color: var(--gold); }
    .listing-img { height: 240px; background-size: cover; background-position: center; position: relative; }
    .listing-tag { position: absolute; top: 16px; left: 16px; background: var(--gold); color: var(--dark); padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .listing-content { padding: 24px; }
    .listing-price { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--gray-900); margin-bottom: 6px; }
    .listing-title { font-size: 17px; font-weight: 600; color: var(--gray-900); margin-bottom: 6px; }
    .listing-address { font-size: 14px; color: var(--gray-500); margin-bottom: 16px; }
    .listing-stats { display: flex; gap: 20px; padding-top: 16px; border-top: 1px solid var(--gray-200); }
    .listing-stat { font-size: 14px; color: var(--gray-500); }
    .listing-stat strong { color: var(--gray-900); }
    footer { background: var(--dark); border-top: 1px solid rgba(255,255,255,0.06); padding: 60px 0 36px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 52px; }
    .footer-brand .logo-name { color: var(--white); font-size: 22px; }
    .footer-brand .logo-sub { color: var(--gold); }
    .footer-brand-desc { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.8; margin-top: 16px; max-width: 280px; }
    .footer-col h4 { font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 20px; }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .footer-col ul li a { font-size: 14px; color: rgba(255,255,255,0.55); transition: color 0.2s; }
    .footer-col ul li a:hover { color: var(--gold); }
    .footer-contact-item { font-size: 14px; color: rgba(255,255,255,0.55); margin-bottom: 8px; }
    .footer-contact-item a:hover { color: var(--gold); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .footer-copy { font-size: 13px; color: rgba(255,255,255,0.25); }
    .footer-legal { font-size: 12px; color: rgba(255,255,255,0.2); max-width: 500px; text-align: right; }
    @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; } }
    @media (max-width: 768px) { nav { display: none; } .page-hero h1 { font-size: 32px; } .listings-grid { grid-template-columns: 1fr; } .footer-grid { grid-template-columns: 1fr; gap: 32px; } .footer-legal { text-align: left; } }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-inner">
        <a href="index.html" class="logo-wrap">
          <span class="logo-name">${companyName}</span>
          <span class="logo-sub">Real Estate</span>
        </a>
        <nav>
          <a href="index.html">Home</a>
          <a href="index.html#about">About</a>
          <a href="listings.html">Listings</a>
          <a href="index.html#reviews">Reviews</a>
          <a href="index.html#neighborhoods">Areas</a>
          <a href="blog.html">Blog</a>
          <a href="resources.html">Resources</a>
          <a href="index.html#contact">Contact</a>
        </nav>
        <div class="header-right">
          <a href="tel:${phone}" class="header-phone">${phone}</a>
          <a href="index.html#contact" class="btn-talk">Let's Talk</a>
        </div>
      </div>
    </div>
  </header>
  <section class="page-hero">
    <div class="container"><h1>Property Listings</h1><p>Browse our available properties in ${city}, ${provFull}</p></div>
  </section>
  <section class="filters">
    <div class="container">
      <div class="filters-inner">
        <select><option>All Types</option><option>House</option><option>Condo</option><option>Townhouse</option></select>
        <select><option>All Prices</option><option>Under $1M</option><option>$1M - $2M</option><option>$2M - $3M</option><option>$3M+</option></select>
        <select><option>All Bedrooms</option><option>2+</option><option>3+</option><option>4+</option><option>5+</option></select>
        <span class="count">${listings.length} properties found</span>
      </div>
    </div>
  </section>
  <section class="listings">
    <div class="container">
      <div class="listings-grid">
        ${listings.map(l => `<div class="listing-card"><div class="listing-img" style="background-image: url('${l.image}')"><span class="listing-tag">${l.type}</span></div><div class="listing-content"><div class="listing-price">${l.price}</div><div class="listing-title">${l.title}</div><div class="listing-address">${l.address}, ${city}</div><div class="listing-stats"><span class="listing-stat"><strong>${l.beds}</strong> Beds</span><span class="listing-stat"><strong>${l.baths}</strong> Baths</span><span class="listing-stat"><strong>${l.sqft}</strong> sqft</span></div></div></div>`).join('')}
      </div>
    </div>
  </section>
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo-wrap">
            <span class="logo-name">${companyName}</span>
            <span class="logo-sub">Real Estate</span>
          </div>
          <p class="footer-brand-desc">Helping families find their perfect home in Greater ${city}. Your trusted partner for buying, selling, and investing in the ${provFull} market.</p>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="index.html#about">About</a></li>
            <li><a href="listings.html">Listings</a></li>
            <li><a href="index.html#reviews">Reviews</a></li>
            <li><a href="index.html#neighborhoods">Areas</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="index.html#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="resources.html">Mortgage Calculator</a></li>
            <li><a href="resources.html">Buyer's Guide</a></li>
            <li><a href="resources.html">Seller's Guide</a></li>
            <li><a href="resources.html">Market Reports</a></li>
            <li><a href="resources.html">FAQ</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Get in Touch</h4>
          <div class="footer-contact-item"><a href="tel:${phone}">${phone}</a></div>
          <div class="footer-contact-item"><a href="mailto:${email}">${email}</a></div>
          <div class="footer-contact-item">${city}, ${province}, Canada</div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p class="footer-legal">The trademarks REALTOR&reg;, REALTORS&reg;, and the REALTOR&reg; logo are controlled by The Canadian Real Estate Association (CREA).</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function generateBlogPage(details: Record<string, string>): string {
  const { companyName = 'Real Estate', city = 'Toronto', province = 'ON', phone = '(604) 555-0192', email = 'hello@realestate.com' } = details;
  const provinceName: Record<string, string> = { ON: 'Ontario', BC: 'British Columbia', AB: 'Alberta', QC: 'Quebec' };
  const provFull = provinceName[province] || province;

  const posts = [
    { title: 'Top 10 Tips for First-Time Home Buyers', excerpt: 'Buying your first home is one of the biggest decisions you\'ll make. Here are our top tips to help you navigate the process with confidence.', date: 'March 10, 2026', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80', category: 'Buying' },
    { title: '2026 Real Estate Market Trends', excerpt: 'The real estate market continues to evolve. Here\'s what buyers and sellers need to know about the current landscape.', date: 'February 28, 2026', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80', category: 'Market' },
    { title: 'How to Stage Your Home for a Quick Sale', excerpt: 'First impressions matter. Learn how to stage your home to attract more buyers and get top dollar for your property.', date: 'February 15, 2026', image: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80', category: 'Selling' },
    { title: 'Best Neighborhoods for Families in Toronto', excerpt: 'Looking for the perfect family neighborhood? We\'ve compiled a list of the top areas in Toronto for families.', date: 'February 1, 2026', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', category: 'Guide' },
    { title: 'Understanding Mortgage Rates in 2026', excerpt: 'Mortgage rates play a crucial role in your home buying journey. Here\'s what you need to know about current rates.', date: 'January 20, 2026', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80', category: 'Finance' },
    { title: 'Condo vs House: Which is Right for You?', excerpt: 'We break down the pros and cons of condos and houses to help you make the right choice for your lifestyle.', date: 'January 10, 2026', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', category: 'Guide' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog | ${companyName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --gold: #C9A96E; --gold-light: #C9A96E33; --gold-mid: #C9A96E88; --dark: #0a0a0f; --dark-2: #13131a; --dark-3: #1c1c26; --white: #ffffff; --off-white: #faf9f7; --gray-100: #f4f3f0; --gray-200: #e8e6e1; --gray-400: #9d9b95; --gray-500: #6b6963; --gray-700: #3a3935; --gray-900: #1a1917; }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; color: var(--gray-700); background: var(--white); line-height: 1.65; overflow-x: hidden; }
    a { text-decoration: none; color: inherit; }
    img { max-width: 100%; display: block; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
    header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--gray-200); transition: all 0.3s ease; }
    .header-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; gap: 24px; }
    .logo-wrap { display: flex; flex-direction: column; }
    .logo-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--gray-900); letter-spacing: -0.3px; line-height: 1; }
    .logo-sub { font-size: 11px; font-weight: 400; color: var(--gold); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; }
    nav { display: flex; align-items: center; gap: 28px; }
    nav a { font-size: 14px; font-weight: 500; color: var(--gray-500); transition: color 0.2s; letter-spacing: 0.2px; }
    nav a:hover { color: var(--gray-900); }
    .header-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
    .header-phone { font-size: 14px; font-weight: 500; color: var(--gray-700); }
    .btn-talk { background: var(--dark); color: var(--white); padding: 10px 22px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.3px; transition: all 0.25s; white-space: nowrap; }
    .btn-talk:hover { background: var(--gold); color: var(--dark); }
    .page-hero { background: var(--dark); padding: 140px 0 80px; text-align: center; position: relative; overflow: hidden; }
    .page-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, var(--gold) 0%, transparent 70%); opacity: 0.1; }
    .page-hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(36px, 5vw, 56px); font-weight: 700; color: var(--white); line-height: 1.12; letter-spacing: -1px; margin-bottom: 18px; position: relative; }
    .page-hero p { font-size: 17px; color: rgba(255,255,255,0.6); max-width: 540px; margin: 0 auto; position: relative; }
    .categories { padding: 32px 0; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .category { padding: 8px 20px; border: 1px solid var(--gray-200); border-radius: 24px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit; background: var(--white); color: var(--gray-500); }
    .category:hover, .category.active { background: var(--gold); color: var(--dark); border-color: var(--gold); }
    .blog-section { padding: 64px 0; }
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px; }
    .blog-card { background: var(--white); border: 1px solid var(--gray-200); border-radius: 14px; overflow: hidden; transition: all 0.3s; }
    .blog-card:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.1); border-color: var(--gold); }
    .blog-img { height: 200px; background-size: cover; background-position: center; }
    .blog-content { padding: 24px; }
    .blog-category { display: inline-block; background: var(--gray-100); color: var(--gray-500); padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
    .blog-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--gray-900); margin-bottom: 12px; line-height: 1.3; }
    .blog-excerpt { font-size: 14px; color: var(--gray-500); margin-bottom: 16px; }
    .blog-meta { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--gray-400); }
    footer { background: var(--dark); border-top: 1px solid rgba(255,255,255,0.06); padding: 60px 0 36px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 52px; }
    .footer-brand .logo-name { color: var(--white); font-size: 22px; }
    .footer-brand .logo-sub { color: var(--gold); }
    .footer-brand-desc { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.8; margin-top: 16px; max-width: 280px; }
    .footer-col h4 { font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 20px; }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .footer-col ul li a { font-size: 14px; color: rgba(255,255,255,0.55); transition: color 0.2s; }
    .footer-col ul li a:hover { color: var(--gold); }
    .footer-contact-item { font-size: 14px; color: rgba(255,255,255,0.55); margin-bottom: 8px; }
    .footer-contact-item a:hover { color: var(--gold); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .footer-copy { font-size: 13px; color: rgba(255,255,255,0.25); }
    .footer-legal { font-size: 12px; color: rgba(255,255,255,0.2); max-width: 500px; text-align: right; }
    @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; } }
    @media (max-width: 768px) { nav { display: none; } .page-hero h1 { font-size: 32px; } .blog-grid { grid-template-columns: 1fr; } .footer-grid { grid-template-columns: 1fr; gap: 32px; } .footer-legal { text-align: left; } }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-inner">
        <a href="index.html" class="logo-wrap">
          <span class="logo-name">${companyName}</span>
          <span class="logo-sub">Real Estate</span>
        </a>
        <nav>
          <a href="index.html">Home</a>
          <a href="index.html#about">About</a>
          <a href="listings.html">Listings</a>
          <a href="index.html#reviews">Reviews</a>
          <a href="index.html#neighborhoods">Areas</a>
          <a href="blog.html">Blog</a>
          <a href="resources.html">Resources</a>
          <a href="index.html#contact">Contact</a>
        </nav>
        <div class="header-right">
          <a href="tel:${phone}" class="header-phone">${phone}</a>
          <a href="index.html#contact" class="btn-talk">Let's Talk</a>
        </div>
      </div>
    </div>
  </header>
  <section class="page-hero">
    <div class="container"><h1>Real Estate Blog</h1><p>Expert insights, tips, and market updates from ${companyName}</p></div>
  </section>
  <section class="categories">
    <div class="container">
      <span class="category active">All Posts</span>
      <span class="category">Buying</span>
      <span class="category">Selling</span>
      <span class="category">Market</span>
      <span class="category">Finance</span>
      <span class="category">Guide</span>
    </div>
  </section>
  <section class="blog-section">
    <div class="container">
      <div class="blog-grid">
        ${posts.map(p => `<div class="blog-card"><div class="blog-img" style="background-image: url('${p.image}')"></div><div class="blog-content"><span class="blog-category">${p.category}</span><div class="blog-title">${p.title}</div><p class="blog-excerpt">${p.excerpt}</p><div class="blog-meta"><span>${p.date}</span><span>Read more →</span></div></div></div>`).join('')}
      </div>
    </div>
  </section>
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo-wrap">
            <span class="logo-name">${companyName}</span>
            <span class="logo-sub">Real Estate</span>
          </div>
          <p class="footer-brand-desc">Helping families find their perfect home in Greater ${city}. Your trusted partner for buying, selling, and investing in the ${provFull} market.</p>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="index.html#about">About</a></li>
            <li><a href="listings.html">Listings</a></li>
            <li><a href="index.html#reviews">Reviews</a></li>
            <li><a href="index.html#neighborhoods">Areas</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="index.html#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="resources.html">Buyer's Guide</a></li>
            <li><a href="resources.html">Seller's Guide</a></li>
            <li><a href="resources.html">Market Reports</a></li>
            <li><a href="resources.html">Open Houses</a></li>
            <li><a href="resources.html">FAQ</a></li>
            <li><a href="resources.html">Mortgage Calculator</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Get in Touch</h4>
          <div class="footer-contact-item"><a href="tel:${phone}">${phone}</a></div>
          <div class="footer-contact-item"><a href="mailto:${email}">${email}</a></div>
          <div class="footer-contact-item">${city}, ${province}, Canada</div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p class="footer-legal">The trademarks REALTOR&reg;, REALTORS&reg;, and the REALTOR&reg; logo are controlled by The Canadian Real Estate Association (CREA).</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

export function generateResourcesPage(details: Record<string, string>): string {
  const {
    companyName = 'Real Estate',
    city = 'Toronto',
    province = 'ON',
    phone = '(604) 555-0192',
    email = 'hello@realestate.com',
  } = details;

  const provinceName: Record<string, string> = { ON: 'Ontario', BC: 'British Columbia', AB: 'Alberta', QC: 'Quebec' };
  const provFull = provinceName[province] || province;

  const freeGuides = [
    {
      id: 'buyer-checklist',
      title: 'First-Time Home Buyer Checklist',
      description: 'A comprehensive step-by-step checklist covering everything from pre-approval to getting your keys. Includes a budget worksheet and timeline planner.',
      icon: 'clipboard',
      category: 'buyers',
    },
    {
      id: 'seller-guide',
      title: 'Home Selling Preparation Guide',
      description: 'Room-by-room guide to preparing your home for sale. Includes staging tips, repair priorities, and a timeline for listing day.',
      icon: 'house',
      category: 'sellers',
    },
    {
      id: 'moving-checklist',
      title: 'Moving Day Checklist',
      description: 'Everything you need to do before, during, and after moving day. Includes address change list, utility setup guide, and packing timeline.',
      icon: 'truck',
      category: 'general',
    },
  ];

  const premiumGuides = [
    {
      id: 'neighborhood-guide',
      title: 'Vancouver Neighbourhood Comparison Guide',
      description: 'Side-by-side comparison of Greater Vancouver\'s top neighbourhoods - pricing, schools, transit, amenities, and lifestyle factors.',
      icon: 'map',
      category: 'buyers',
    },
    {
      id: 'home-value',
      title: 'Understanding Your Home\'s Value',
      description: 'Learn how Comparative Market Analysis works, what factors affect your home\'s value, and how to price your property for maximum return.',
      icon: 'trending',
      category: 'sellers',
    },
  ];

  function getIconSVG(name: string): string {
    const icons: Record<string, string> = {
      clipboard: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>',
      house: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
      truck: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
      map: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>',
      trending: '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>'
    };
    return icons[name] || icons.clipboard;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resources & Guides | ${companyName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --gold: #C9A96E;
      --gold-light: #C9A96E33;
      --gold-mid: #C9A96E88;
      --gold-pale: #F5EFE3;
      --dark: #0a0a0f;
      --dark-2: #13131a;
      --dark-3: #1c1c26;
      --white: #ffffff;
      --off-white: #F5EFE3;
      --gray-100: #f4f3f0;
      --gray-200: #e8e6e1;
      --gray-400: #9d9b95;
      --gray-500: #6b6963;
      --gray-700: #3a3935;
      --gray-900: #1a1917;
    }
    html { scroll-behavior: smooth; }
    body { font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: var(--gray-700); background: var(--off-white); line-height: 1.6; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
    a { text-decoration: none; color: inherit; }
    img { max-width: 100%; display: block; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }
    header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.96); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--gray-200); }
    .header-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; gap: 24px; }
    .logo-wrap { display: flex; flex-direction: column; }
    .logo-name { font-family: 'Libre Baskerville', Georgia, serif; font-size: 19px; font-weight: 700; color: var(--gray-900); letter-spacing: -0.2px; line-height: 1.2; }
    .logo-sub { font-size: 10px; font-weight: 400; color: var(--gold); letter-spacing: 1.8px; text-transform: uppercase; margin-top: 2px; }
    nav { display: flex; align-items: center; gap: 28px; }
    nav a { font-size: 14px; font-weight: 500; color: var(--gray-500); transition: color 0.2s; letter-spacing: 0.15px; }
    nav a:hover { color: var(--gray-900); }
    nav a.active { color: var(--gold); }
    .header-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
    .header-phone { font-size: 14px; font-weight: 500; color: var(--gray-700); }
    .btn-talk { background: var(--dark); color: var(--white); padding: 10px 22px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.3px; transition: all 0.25s; white-space: nowrap; }
    .btn-talk:hover { background: var(--gold); color: var(--dark); }

    .page-hero { background: var(--dark); padding: 150px 0 80px; text-align: center; position: relative; overflow: hidden; }
    .page-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, var(--gold) 0%, transparent 70%); opacity: 0.12; }
    .page-hero h1 { font-family: 'Libre Baskerville', Georgia, serif; font-size: clamp(32px, 4.5vw, 48px); font-weight: 700; color: var(--white); line-height: 1.15; letter-spacing: -0.5px; margin-bottom: 16px; position: relative; }
    .page-hero p { font-size: 17px; color: rgba(255,255,255,0.55); max-width: 500px; margin: 0 auto; position: relative; }

    .filter-bar { padding: 28px 0; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; background: var(--white); border-bottom: 1px solid var(--gray-200); }
    .filter-btn { padding: 9px 22px; border: 1px solid var(--gray-200); border-radius: 50px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit; background: var(--white); color: var(--gray-500); }
    .filter-btn:hover { border-color: var(--gold); color: var(--gold); }
    .filter-btn.active { background: var(--gold); color: var(--dark); border-color: var(--gold); }

    .section { padding: 72px 0; }
    .section:nth-child(even) { background: var(--white); }
    .section-header { text-align: center; max-width: 560px; margin: 0 auto 44px; }
    .section-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: var(--gold); margin-bottom: 10px; }
    .section-title { font-family: 'Libre Baskerville', Georgia, serif; font-size: clamp(26px, 3vw, 36px); font-weight: 700; color: var(--gray-900); line-height: 1.2; letter-spacing: -0.3px; }

    .calc-card { background: var(--white); border-radius: 16px; padding: 36px; box-shadow: 0 2px 16px rgba(0,0,0,0.05); border: 1px solid var(--gray-200); }
    .calc-layout { display: grid; grid-template-columns: 1fr 320px; gap: 48px; align-items: start; }
    .calc-inputs { display: flex; flex-direction: column; gap: 24px; }
    .calc-group { }
    .calc-label { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
    .calc-label span { font-size: 13px; font-weight: 500; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.5px; }
    .calc-value { font-size: 18px; font-weight: 600; color: var(--gray-900); font-variant-numeric: tabular-nums; }
    .calc-slider { width: 100%; height: 6px; -webkit-appearance: none; appearance: none; background: var(--gray-200); border-radius: 3px; outline: none; cursor: pointer; }
    .calc-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--gold); cursor: pointer; box-shadow: 0 2px 6px rgba(201,169,110,0.35); }
    .calc-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: var(--gold); cursor: pointer; border: none; box-shadow: 0 2px 6px rgba(201,169,110,0.35); }

    .calc-results { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 28px; background: var(--gray-100); border-radius: 14px; }
    .donut-wrap { position: relative; width: 180px; height: 180px; }
    .donut-chart { width: 100%; height: 100%; transform: rotate(-90deg); }
    .donut-bg { fill: none; stroke: var(--gray-200); stroke-width: 18; }
    .donut-segment { fill: none; stroke-width: 18; transition: stroke-dasharray 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .donut-pi { stroke: var(--gold); }
    .donut-tax { stroke: #9B8B70; }
    .donut-ins { stroke: #B5A590; }
    .donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
    .monthly-label { font-size: 11px; color: var(--gray-500); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
    .monthly-amount { font-family: 'Libre Baskerville', Georgia, serif; font-size: 26px; font-weight: 700; color: var(--gray-900); }
    .breakdown { display: flex; flex-direction: column; gap: 6px; width: 100%; }
    .breakdown-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--gray-500); padding: 4px 0; }
    .breakdown-item strong { font-weight: 600; color: var(--gray-800); font-variant-numeric: tabular-nums; }
    .breakdown-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; flex-shrink: 0; }
    .breakdown-total { margin-top: 8px; padding-top: 10px; border-top: 1px solid var(--gray-200); font-size: 13px; font-weight: 500; }

    .guides-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .guide-card { background: var(--white); border-radius: 12px; padding: 24px; border: 1px solid var(--gray-200); transition: all 0.25s; display: flex; flex-direction: column; }
    .guide-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: var(--gold); }
    .guide-icon { width: 48px; height: 48px; border-radius: 10px; background: var(--gold-pale); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; flex-shrink: 0; }
    .guide-icon svg { width: 24px; height: 24px; color: var(--gold); }
    .guide-card.locked .guide-icon { background: var(--gray-100); }
    .guide-card.locked .guide-icon svg { color: var(--gray-400); }
    .guide-card h3 { font-family: 'Libre Baskerville', Georgia, serif; font-size: 17px; font-weight: 700; color: var(--gray-900); margin-bottom: 8px; line-height: 1.3; }
    .guide-card p { font-size: 14px; color: var(--gray-500); line-height: 1.6; flex: 1; margin-bottom: 16px; }
    .guide-actions { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
    .guide-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; font-family: inherit; background: var(--dark); color: var(--white); }
    .guide-btn:hover { background: var(--gold); color: var(--dark); }
    .guide-btn svg { width: 14px; height: 14px; }
    .guide-btn.locked { background: var(--gray-100); color: var(--gray-500); cursor: default; }
    .guide-btn.locked:hover { background: var(--gray-100); color: var(--gray-500); }

    .premium-section { background: var(--gray-100); }
    .premium-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--dark); color: var(--white); padding: 5px 12px; border-radius: 50px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 16px; }
    .premium-badge svg { width: 12px; height: 12px; }

    .cta-section { padding: 72px 0; background: var(--dark); text-align: center; }
    .cta-section h2 { font-family: 'Libre Baskerville', Georgia, serif; font-size: clamp(24px, 3vw, 32px); font-weight: 700; color: var(--white); margin-bottom: 14px; }
    .cta-section p { font-size: 16px; color: rgba(255,255,255,0.45); max-width: 460px; margin: 0 auto 28px; }
    .cta-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--gold); color: var(--dark); padding: 14px 32px; border-radius: 7px; font-size: 14px; font-weight: 600; transition: all 0.25s; }
    .cta-btn:hover { background: var(--white); transform: translateY(-2px); }

    footer { background: var(--dark); border-top: 1px solid rgba(255,255,255,0.06); padding: 56px 0 32px; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 44px; margin-bottom: 48px; }
    .footer-brand .logo-name { color: var(--white); font-size: 20px; }
    .footer-brand .logo-sub { color: var(--gold); }
    .footer-brand-desc { font-size: 14px; color: rgba(255,255,255,0.35); line-height: 1.7; margin-top: 14px; max-width: 260px; }
    .footer-col h4 { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 18px; }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 9px; }
    .footer-col ul li a { font-size: 14px; color: rgba(255,255,255,0.5); transition: color 0.2s; }
    .footer-col ul li a:hover { color: var(--gold); }
    .footer-contact-item { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 7px; }
    .footer-contact-item a:hover { color: var(--gold); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .footer-copy { font-size: 12px; color: rgba(255,255,255,0.2); }
    .footer-legal { font-size: 11px; color: rgba(255,255,255,0.15); max-width: 480px; text-align: right; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: none; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
    .modal-overlay.active { display: flex; }
    .modal { background: var(--white); border-radius: 16px; padding: 36px; max-width: 420px; width: 90%; text-align: center; position: relative; }
    .modal h3 { font-family: 'Libre Baskerville', Georgia, serif; font-size: 22px; color: var(--gray-900); margin-bottom: 10px; }
    .modal p { font-size: 14px; color: var(--gray-500); margin-bottom: 22px; }
    .modal input { width: 100%; padding: 13px 15px; border: 1px solid var(--gray-200); border-radius: 7px; font-size: 14px; font-family: inherit; margin-bottom: 14px; outline: none; transition: border-color 0.2s; }
    .modal input:focus { border-color: var(--gold); }
    .modal-btn { width: 100%; padding: 13px; background: var(--dark); color: var(--white); border: none; border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; font-family: inherit; }
    .modal-btn:hover { background: var(--gold); color: var(--dark); }
    .modal-close { position: absolute; top: 14px; right: 14px; width: 30px; height: 30px; border: none; background: var(--gray-100); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .modal-close svg { width: 16px; height: 16px; color: var(--gray-500); }

    @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; } }
    @media (max-width: 768px) {
      nav { display: none; }
      .header-phone { display: none; }
      .page-hero h1 { font-size: 30px; }
      .calc-layout { grid-template-columns: 1fr; }
      .calc-results { order: -1; }
      .guides-grid { grid-template-columns: 1fr; }
      .footer-grid { grid-template-columns: 1fr; gap: 28px; }
      .footer-legal { text-align: left; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-inner">
        <a href="index.html" class="logo-wrap">
          <span class="logo-name">${companyName}</span>
          <span class="logo-sub">Real Estate</span>
        </a>
        <nav>
          <a href="index.html">Home</a>
          <a href="index.html#about">About</a>
          <a href="listings.html">Listings</a>
          <a href="index.html#reviews">Reviews</a>
          <a href="index.html#neighborhoods">Areas</a>
          <a href="blog.html">Blog</a>
          <a href="resources.html" class="active">Resources</a>
          <a href="index.html#contact">Contact</a>
        </nav>
        <div class="header-right">
          <a href="tel:${phone}" class="header-phone">${phone}</a>
          <a href="index.html#contact" class="btn-talk">Let's Talk</a>
        </div>
      </div>
    </div>
  </header>

  <section class="page-hero">
    <div class="container">
      <h1>Resources & Guides</h1>
      <p>Everything you need to make confident real estate decisions in ${provFull}.</p>
    </div>
  </section>

  <div class="filter-bar">
    <button class="filter-btn active" data-filter="all">All Resources</button>
    <button class="filter-btn" data-filter="buyers">For Buyers</button>
    <button class="filter-btn" data-filter="sellers">For Sellers</button>
    <button class="filter-btn" data-filter="general">General</button>
  </div>

  <section class="section">
    <div class="container">
      <div class="section-header">
        <div class="section-eyebrow">Interactive Tools</div>
        <h2 class="section-title">Mortgage Calculator</h2>
      </div>
      <div class="calc-card">
        <div class="calc-layout">
          <div class="calc-inputs">
            <div class="calc-group">
              <div class="calc-label">
                <span>Purchase Price</span>
                <span class="calc-value" id="priceValue">$1M</span>
              </div>
              <input type="range" class="calc-slider" id="priceSlider" min="100000" max="5000000" step="25000" value="1000000">
            </div>
            <div class="calc-group">
              <div class="calc-label">
                <span>Down Payment</span>
                <span class="calc-value" id="downValue">20%</span>
              </div>
              <input type="range" class="calc-slider" id="downSlider" min="5" max="50" step="1" value="20">
            </div>
            <div class="calc-group">
              <div class="calc-label">
                <span>Interest Rate</span>
                <span class="calc-value" id="rateValue">4.5%</span>
              </div>
              <input type="range" class="calc-slider" id="rateSlider" min="1" max="12" step="0.1" value="4.5">
            </div>
            <div class="calc-group">
              <div class="calc-label">
                <span>Amortization</span>
                <span class="calc-value" id="amortValue">25 years</span>
              </div>
              <input type="range" class="calc-slider" id="amortSlider" min="5" max="50" step="1" value="25">
            </div>
          </div>
              <div class="calc-results">
            <div class="donut-wrap">
              <svg class="donut-chart" viewBox="0 0 100 100">
                <circle class="donut-bg" cx="50" cy="50" r="38"/>
                <circle class="donut-segment donut-pi" cx="50" cy="50" r="38" stroke-dasharray="0 238.76" stroke-dashoffset="0" id="donutPI"/>
                <circle class="donut-segment donut-tax" cx="50" cy="50" r="38" stroke-dasharray="0 238.76" stroke-dashoffset="0" id="donutTax"/>
                <circle class="donut-segment donut-ins" cx="50" cy="50" r="38" stroke-dasharray="0 238.76" stroke-dashoffset="0" id="donutIns"/>
              </svg>
              <div class="donut-center">
                <div class="monthly-label">Monthly</div>
                <div class="monthly-amount" id="monthlyPayment">$4,938</div>
              </div>
            </div>
            <div class="breakdown">
              <div class="breakdown-item">
                <span><span class="breakdown-dot" style="background: var(--gold)"></span>Principal & Interest</span>
                <strong id="piAmount">$4,455</strong>
              </div>
              <div class="breakdown-item">
                <span><span class="breakdown-dot" style="background: #9B8B70"></span>Property Tax</span>
                <strong id="taxAmount">$333</strong>
              </div>
              <div class="breakdown-item">
                <span><span class="breakdown-dot" style="background: #B5A590"></span>Insurance</span>
                <strong id="insAmount">$150</strong>
              </div>
              <div class="breakdown-item breakdown-total">
                <span>Total Interest</span>
                <strong id="totalInterest">$535K</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="section-header">
        <div class="section-eyebrow">Free Downloads</div>
        <h2 class="section-title">Helpful Guides</h2>
      </div>
      <div class="guides-grid" id="freeGuidesGrid">
        ${freeGuides.map(g => `
        <div class="guide-card" data-category="${g.category}">
          <div class="guide-icon">${getIconSVG(g.icon)}</div>
          <h3>${g.title}</h3>
          <p>${g.description}</p>
          <div class="guide-actions">
            <button class="guide-btn" onclick="downloadGuide('${g.id}')">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download
            </button>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section class="section premium-section">
    <div class="container">
      <div class="section-header">
        <div class="premium-badge">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          Premium Content
        </div>
        <h2 class="section-title">Exclusive Guides</h2>
      </div>
      <div class="guides-grid" id="premiumGuidesGrid">
        ${premiumGuides.map(g => `
        <div class="guide-card locked" data-category="${g.category}">
          <div class="guide-icon">${getIconSVG(g.icon)}</div>
          <h3>${g.title}</h3>
          <p>${g.description}</p>
          <div class="guide-actions">
            <button class="guide-btn locked" onclick="showEmailModal('${g.id}')">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Get Access
            </button>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="container">
      <h2>Want Personalized Advice?</h2>
      <p>Get in touch for custom guidance tailored to your specific situation.</p>
      <a href="index.html#contact" class="cta-btn">
        Let's Talk
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </a>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo-wrap">
            <span class="logo-name">${companyName}</span>
            <span class="logo-sub">Real Estate</span>
          </div>
          <p class="footer-brand-desc">Helping families find their perfect home in Greater ${city}. Your trusted partner for buying, selling, and investing in the ${provFull} market.</p>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="index.html#about">About</a></li>
            <li><a href="listings.html">Listings</a></li>
            <li><a href="index.html#reviews">Reviews</a></li>
            <li><a href="index.html#neighborhoods"> Areas</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="index.html#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="resources.html">Mortgage Calculator</a></li>
            <li><a href="resources.html">Buyer's Guide</a></li>
            <li><a href="resources.html">Seller's Guide</a></li>
            <li><a href="resources.html">Market Reports</a></li>
            <li><a href="resources.html">FAQ</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Get in Touch</h4>
          <div class="footer-contact-item"><a href="tel:${phone}">${phone}</a></div>
          <div class="footer-contact-item"><a href="mailto:${email}">${email}</a></div>
          <div class="footer-contact-item">${city}, ${province}, Canada</div>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copy">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p class="footer-legal">The trademarks REALTOR&reg;, REALTORS&reg;, and the REALTOR&reg; logo are controlled by The Canadian Real Estate Association (CREA).</p>
      </div>
    </div>
  </footer>

  <div class="modal-overlay" id="emailModal">
    <div class="modal">
      <button class="modal-close" onclick="closeModal()">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <h3>Get Instant Access</h3>
      <p>Enter your email to receive this exclusive guide.</p>
      <input type="email" id="modalEmail" placeholder="your@email.com" required>
      <button class="modal-btn" onclick="submitEmail()">Send Me the Guide</button>
    </div>
  </div>

  <script>
    const priceSlider = document.getElementById('priceSlider');
    const downSlider = document.getElementById('downSlider');
    const rateSlider = document.getElementById('rateSlider');
    const amortSlider = document.getElementById('amortSlider');
    const priceVal = document.getElementById('priceValue');
    const downVal = document.getElementById('downValue');
    const rateVal = document.getElementById('rateValue');
    const amortVal = document.getElementById('amortValue');
    const monthlyPayment = document.getElementById('monthlyPayment');
    const piAmount = document.getElementById('piAmount');
    const taxAmount = document.getElementById('taxAmount');
    const insAmount = document.getElementById('insAmount');
    const totalInterest = document.getElementById('totalInterest');
    const donutPI = document.getElementById('donutPI');
    const donutTax = document.getElementById('donutTax');
    const donutIns = document.getElementById('donutIns');

    function humanizePrice(num) {
      if (num >= 1000000) return '$' + (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
      return '$' + num;
    }

    function humanizeNum(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
      return num.toLocaleString();
    }

    function formatCurrency(num) {
      return '$' + Math.round(num).toLocaleString();
    }

    function calculateMortgage() {
      const price = parseInt(priceSlider.value);
      const downPct = parseInt(downSlider.value);
      const rate = parseFloat(rateSlider.value);
      const years = parseInt(amortSlider.value);

      const downPayment = price * (downPct / 100);
      const loanAmount = price - downPayment;
      const monthlyRate = (rate / 100) / 12;
      const numPayments = years * 12;

      const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      const monthlyTax = (price * 0.004) / 12;
      const monthlyIns = (price * 0.0018) / 12;
      const totalMonthly = monthlyPI + monthlyTax + monthlyIns;
      const totalInt = (monthlyPI * numPayments) - loanAmount;

      priceVal.textContent = humanizePrice(price);
      downVal.textContent = downPct + '%';
      rateVal.textContent = rate.toFixed(1) + '%';
      amortVal.textContent = years + ' years';
      monthlyPayment.textContent = formatCurrency(totalMonthly);
      piAmount.textContent = formatCurrency(monthlyPI);
      taxAmount.textContent = formatCurrency(monthlyTax);
      insAmount.textContent = formatCurrency(monthlyIns);
      totalInterest.textContent = '$' + humanizeNum(totalInt);

      const circ = 2 * Math.PI * 38;
      const maxArc = circ * 0.75;
      const total = monthlyPI + monthlyTax + monthlyIns;
      const piArc = (monthlyPI / total) * maxArc;
      const taxArc = (monthlyTax / total) * maxArc;
      const insArc = (monthlyIns / total) * maxArc;
      const gap = circ - maxArc;

      donutPI.setAttribute('stroke-dasharray', piArc + ' ' + gap);
      donutPI.setAttribute('stroke-dashoffset', '0');
      donutTax.setAttribute('stroke-dasharray', taxArc + ' ' + gap);
      donutTax.setAttribute('stroke-dashoffset', -(piArc + gap));
      donutIns.setAttribute('stroke-dasharray', insArc + ' ' + gap);
      donutIns.setAttribute('stroke-dashoffset', -(piArc + gap + taxArc + gap));
    }

    priceSlider.addEventListener('input', calculateMortgage);
    downSlider.addEventListener('input', calculateMortgage);
    rateSlider.addEventListener('input', calculateMortgage);
    amortSlider.addEventListener('input', calculateMortgage);

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.guide-card').forEach(card => {
          card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
        });
      });
    });

    function downloadGuide(id) {
      const names = {
        'buyer-checklist': 'First-Time-Buyer-Checklist.pdf',
        'seller-guide': 'Home-Selling-Preparation-Guide.pdf',
        'moving-checklist': 'Moving-Day-Checklist.pdf'
      };
      alert('Download started: ' + names[id] + '\\n\\n(In production, this would download the actual PDF)');
    }

    function showEmailModal(guideId) {
      window.selectedGuide = guideId;
      document.getElementById('emailModal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('emailModal').classList.remove('active');
    }

    function submitEmail() {
      const email = document.getElementById('modalEmail').value;
      if (email && email.includes('@')) {
        const names = {
          'neighborhood-guide': 'Vancouver-Neighbourhood-Comparison-Guide.pdf',
          'home-value': 'Understanding-Your-Home-Value.pdf'
        };
        alert('Thank you! Your guide has been sent to ' + email);
        closeModal();
        document.getElementById('modalEmail').value = '';
      } else {
        alert('Please enter a valid email address');
      }
    }

    document.getElementById('emailModal').addEventListener('click', e => {
      if (e.target.id === 'emailModal') closeModal();
    });

    calculateMortgage();
  </script>
</body>
</html>`;
}

export async function deployToGitHub(
  userId: string,
  siteId: string,
  templateId: string,
  details: Record<string, string>,
  siteName?: string,
  imageBuffer?: Buffer | null,
  imageContentType?: string | null
): Promise<DeployResult> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { success: false, error: 'GitHub token not configured' };
  }

  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({ auth: token });

  const repoName = `webforge-${siteId}`.toLowerCase();

  console.log('=== GitHub Pages Deploy ===');
  console.log('Repo:', repoName);

  try {
    // ---------------------------
    // 1. CHECK / CREATE REPO
    // ---------------------------
    const exists = await repoExists(octokit, repoName);

    if (!exists) {
      try {
        await octokit.repos.createInOrg({
          org: ORG,
          name: repoName,
          private: false,
        });
        console.log('Repo created');
      } catch (createErr: any) {
        if (createErr.status === 422) {
          console.log('Repo already exists, continuing...');
        } else {
          throw createErr;
        }
      }
    }

    // ---------------------------
    // 2. HANDLE IMAGE UPLOAD
    // ---------------------------
    let agentPhotoUrl = 
      details.agentPhotoUrl ||
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80';

    // If no new image uploaded, check if user already has an image in their repo
    if (!imageBuffer && !imageContentType) {
      try {
        const existing = await octokit.repos.getContent({
          owner: ORG,
          repo: repoName,
          path: 'assets/agent-photo.webp',
        });
        if (existing.data) {
          agentPhotoUrl = `https://raw.githubusercontent.com/${ORG}/${repoName}/main/assets/agent-photo.webp`;
        }
      } catch {
        // No existing image, use default or details URL
      }
    } else if (imageBuffer && imageContentType) {
      const sharp = (await import('sharp')).default;

      const resizedBuffer = await sharp(imageBuffer)
        .resize(800, 1000, { fit: 'cover', position: 'top' })
        .webp({ quality: 85 })
        .toBuffer();

      const imageBase64 = resizedBuffer.toString('base64');
      const imagePath = 'assets/agent-photo.webp';

      let sha: string | undefined;

      try {
        const existing = await octokit.repos.getContent({
          owner: ORG,
          repo: repoName,
          path: imagePath,
        });
        sha = (existing.data as any).sha;
      } catch {}

      await octokit.repos.createOrUpdateFileContents({
        owner: ORG,
        repo: repoName,
        path: imagePath,
        message: 'Upload agent photo',
        content: imageBase64,
        ...(sha && { sha }),
      });

      agentPhotoUrl = `https://raw.githubusercontent.com/${ORG}/${repoName}/main/${imagePath}`;
    }

    // ---------------------------
    // 3. GENERATE FILES
    // ---------------------------
    const html = generateRealEstateHTML({ ...details, agentPhotoUrl });
    const listingsHtml = generateListingsPage(details);
    const blogHtml = generateBlogPage(details);
    const resourcesHtml = generateResourcesPage(details);

    const files = [
      { path: 'index.html', content: html },
      { path: 'listings.html', content: listingsHtml },
      { path: 'blog.html', content: blogHtml },
      { path: 'resources.html', content: resourcesHtml },
    ];

    // ---------------------------
    // 4. UPLOAD FILES
    // ---------------------------
    for (const file of files) {
      const content = Buffer.from(file.content).toString('base64');

      let sha: string | undefined;

      try {
        const existing = await octokit.repos.getContent({
          owner: ORG,
          repo: repoName,
          path: file.path,
        });
        sha = (existing.data as any).sha;
      } catch {}

      await octokit.repos.createOrUpdateFileContents({
        owner: ORG,
        repo: repoName,
        path: file.path,
        message: `Deploy ${file.path}`,
        content,
        ...(sha && { sha }),
      });
    }

    console.log('Files uploaded');

    // ---------------------------
    // 5. ENABLE GITHUB PAGES ✅
    // ---------------------------
    try {
      await octokit.request('POST /repos/{owner}/{repo}/pages', {
        owner: ORG,
        repo: repoName,
        source: {
          branch: 'main',
          path: '/',
        },
      });
      console.log('GitHub Pages enabled');
    } catch (err: any) {
      if (err.status === 409) {
        console.log('Pages already enabled');
      } else {
        console.log('Pages enable error:', err.message);
      }
    }

    // ---------------------------
    // 6. OPTIONAL: TRIGGER BUILD
    // ---------------------------
    try {
      await octokit.repos.getPagesBuild({
        owner: ORG,
        repo: repoName,
        build_id: 0
      });
      console.log('Pages build triggered');
    } catch (err: any) {
      console.log('Build trigger skipped:', err.message);
    }

    // ---------------------------
    // 7. RETURN URL
    // ---------------------------
    const url = `https://${ORG.toLowerCase()}.github.io/${repoName}/`;

    console.log('Deployed to:', url);

    return { success: true, url };

  } catch (err: any) {
    console.error('GitHub deploy error:', err.message);
    return { success: false, error: err.message };
  }
}