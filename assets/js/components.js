(function () {
  'use strict';

  var DATA_PATH = 'data/';
  var PAGE = document.body.getAttribute('data-page') || 'home';

  function load(file) {
    return fetch(DATA_PATH + file).then(function (r) { return r.json(); });
  }

  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ── Page renderers ── */

  function renderHomePage(club) {
    return '' +
      '<section id="banner">' +
        '<div class="content">' +
          '<header>' +
            '<h1>' + esc(club.name) + '</h1>' +
            '<p>' + esc(club.tagline) + '</p>' +
          '</header>' +
          '<p>Home of the <strong>Robins</strong> (senior teams) and <strong>East Leake Bantams</strong> (youth, girls &amp; ladies). A village football club rooted in community, driven by passion, and building for the future.</p>' +
          '<ul class="actions">' +
            '<li><a href="about.html" class="button big">About Us</a></li>' +
            '<li><a href="register.html" class="button big primary">Register &amp; Pay</a></li>' +
          '</ul>' +
        '</div>' +
        '<span class="image object">' +
          '<img src="images/Bantams.webp" alt="' + esc(club.name) + ' Badge" />' +
        '</span>' +
      '</section>' +
      '<section>' +
        '<header class="major"><h2>Who We Are</h2></header>' +
        '<div class="features">' +
        club.about.map(function (item) {
          return '<article><span class="icon solid ' + esc(item.icon) + '"></span>' +
            '<div class="content"><h3>' + esc(item.title) + '</h3><p>' + item.text + '</p></div></article>';
        }).join('') +
        '</div>' +
        '<ul class="actions"><li><a href="about.html" class="button">Read Our Full Story</a></li></ul>' +
      '</section>';
  }

  function renderAboutPage(club) {
    return '' +
      '<header class="major"><h2>Our Story</h2></header>' +
      club.history.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
      '<hr />' +
      '<header class="major"><h2>Who We Are</h2></header>' +
      '<div class="features">' +
      club.about.map(function (item) {
        return '<article><span class="icon solid ' + esc(item.icon) + '"></span>' +
          '<div class="content"><h3>' + esc(item.title) + '</h3><p>' + item.text + '</p></div></article>';
      }).join('') +
      '</div>';
  }

  function renderTeamsPage(data) {
    var out = '<header class="major"><h2>Our Teams</h2></header>';
    data.sections.forEach(function (section) {
      out += '<h3 class="team-section-heading">' +
        '<span class="icon solid ' + esc(section.icon) + '"></span> ' +
        esc(section.name) +
        ' <span class="team-section-sub">' + esc(section.subtitle) + '</span></h3>';
      out += '<div class="posts">';
      section.teams.forEach(function (team) {
        var mgrLabel = team.managerLabel || 'Manager';
        var coachLabel = team.coachLabel || 'Coach';
        var photo = team.photo
          ? '<img src="' + esc(team.photo) + '" alt="' + esc(team.name) + '" class="team-photo" />'
          : '<div class="team-photo-placeholder"><span class="icon solid fa-camera"></span><br />Team Photo</div>';
        out += '<article>' + photo +
          '<h3>' + esc(team.name) + '</h3>' +
          '<p>' + esc(team.description) + '</p>' +
          '<div class="team-staff"><p><strong>' + esc(mgrLabel) + ':</strong> <em>' + esc(team.manager) + '</em>' +
          '<br /><strong>' + esc(coachLabel) + ':</strong> <em>' + esc(team.coach) + '</em></p></div>' +
          '<ul class="actions">' +
            '<li><a href="register.html" class="button small primary">Register</a></li>' +
            '<li><a href="contact.html" class="button small">Contact</a></li>' +
          '</ul></article>';
      });
      out += '</div>';
    });
    return out;
  }

  function renderRegisterPage(items) {
    var out = '<header class="major"><h2>Registration &amp; Subscriptions</h2></header>' +
      '<p>Ready to join or renew? Use the links below to register and pay your subscriptions online via GoCardless. If you have any questions about registration, please <a href="contact.html">get in touch</a>.</p>' +
      '<div class="posts">';
    items.forEach(function (item) {
      out += '<article class="register-card">' +
        '<span class="icon solid ' + esc(item.icon) + '" style="font-size:2.5em;color:var(--bantams-orange);display:block;margin-bottom:0.5em;"></span>' +
        '<h3>' + esc(item.title) + '</h3>' +
        '<p>' + esc(item.description) + '</p>' +
        '<ul class="actions"><li><a href="' + esc(item.link) + '" class="button primary">' + esc(item.buttonText) + '</a></li></ul>' +
      '</article>';
    });
    out += '</div>';
    return out;
  }

  function renderCommitteePage(committeeData, teamsData) {
    var out = '<header class="major"><h2>Committee &amp; Coaching Staff</h2></header>';
    out += '<h3 class="team-section-heading"><span class="icon solid fa-users-cog"></span> Club Committee</h3>';
    out += '<div class="table-wrapper"><table class="staff-table"><thead><tr><th>Role</th><th>Name</th><th>Contact</th></tr></thead><tbody>';
    committeeData.committee.forEach(function (m) {
      out += '<tr><td>' + esc(m.role) + '</td><td><em>' + esc(m.name) + '</em></td><td><em>' + esc(m.contact) + '</em></td></tr>';
    });
    out += '</tbody></table></div>';
    out += '<h3 class="team-section-heading"><span class="icon solid fa-whistle"></span> Managers &amp; Coaches</h3>';
    out += '<div class="table-wrapper"><table class="staff-table"><thead><tr><th>Team</th><th>Manager</th><th>Coach(es)</th><th>Contact</th></tr></thead><tbody>';
    teamsData.sections.forEach(function (section) {
      section.teams.forEach(function (team) {
        out += '<tr><td><strong>' + esc(section.name) + '</strong> — ' + esc(team.name) + '</td>' +
          '<td><em>' + esc(team.manager) + '</em></td><td><em>' + esc(team.coach) + '</em></td><td><em>' + esc(team.contact) + '</em></td></tr>';
      });
    });
    out += '</tbody></table></div>';
    return out;
  }

  function renderNewsPage(items) {
    var out = '<header class="major"><h2>Club News</h2></header><div class="posts">';
    items.forEach(function (item) {
      out += '<article><h3>' + esc(item.title) + '</h3><p>' + esc(item.text) + '</p>' +
        '<ul class="actions"><li><a href="' + esc(item.link) + '" class="button">' + esc(item.linkText) + '</a></li></ul></article>';
    });
    out += '</div>';
    return out;
  }

  function renderGalleryPage(items) {
    var out = '<header class="major"><h2>Gallery</h2></header>' +
      '<p>Photos coming soon — team photos, matchday action, club events and more.</p><div class="gallery-grid">';
    items.forEach(function (item) {
      if (item.src) {
        out += '<div class="gallery-item"><img src="' + esc(item.src) + '" alt="' + esc(item.caption) + '" /><span>' + esc(item.caption) + '</span></div>';
      } else {
        out += '<div class="gallery-placeholder"><span class="icon solid fa-camera"></span><br />' + esc(item.caption) + '</div>';
      }
    });
    out += '</div>';
    return out;
  }

  function renderMatchdayPage(items) {
    var out = '<header class="major"><h2>Visitor &amp; Matchday Information</h2></header><div class="features">';
    items.forEach(function (item) {
      out += '<article><span class="icon solid ' + esc(item.icon) + '"></span>' +
        '<div class="content"><h3>' + esc(item.title) + '</h3><p>' + item.text + '</p></div></article>';
    });
    out += '</div>' +
      '<div class="badges-row">' +
        '<span><i class="icon solid fa-award"></i> FA Charter Standard</span>' +
        '<span><i class="icon solid fa-handshake"></i> FA Respect</span>' +
        '<span><i class="icon solid fa-heart"></i> Proud For All</span>' +
      '</div>' +
      '<img src="images/details.jpeg" alt="East Leake FC — Visitor information, pitch layout and ground map" class="visitor-info-image" />';
    return out;
  }

  function renderContactPage(club) {
    return '<header class="major"><h2>Contact Us</h2></header>' +
      '<p>Whether you\'re interested in playing, coaching, sponsoring, or just want to come along and watch — we\'d love to hear from you.</p>' +
      '<div class="features">' +
        '<article><span class="icon solid fa-envelope"></span><div class="content">' +
          '<h3>Email</h3><p><a href="mailto:' + esc(club.email) + '">' + esc(club.email) + '</a></p></div></article>' +
        '<article><span class="icon solid fa-map-marker-alt"></span><div class="content">' +
          '<h3>Ground Address</h3><p>' + esc(club.address.line1) + '<br />' + esc(club.address.line2) + '<br />' + esc(club.address.postcode) + '</p>' +
          '<p>What3Words: <strong>' + esc(club.what3words) + '</strong></p></div></article>' +
        '<article><span class="icon brands fa-facebook-f"></span><div class="content">' +
          '<h3>Facebook</h3><p><a href="' + esc(club.socials.facebook) + '">Follow us on Facebook</a></p></div></article>' +
        '<article><span class="icon brands fa-instagram"></span><div class="content">' +
          '<h3>Instagram</h3><p><a href="' + esc(club.socials.instagram) + '">Follow us on Instagram</a></p></div></article>' +
      '</div>';
  }

  /* ── Shared layout ── */

  function renderHeader(club) {
    return '<a href="index.html" class="logo"><strong>' + esc(club.name.replace(' FC', '')) + '</strong> FC</a>' +
      '<ul class="icons">' +
        (club.socials.facebook ? '<li><a href="' + esc(club.socials.facebook) + '" class="icon brands fa-facebook-f"><span class="label">Facebook</span></a></li>' : '') +
        (club.socials.instagram ? '<li><a href="' + esc(club.socials.instagram) + '" class="icon brands fa-instagram"><span class="label">Instagram</span></a></li>' : '') +
        (club.socials.twitter ? '<li><a href="' + esc(club.socials.twitter) + '" class="icon brands fa-twitter"><span class="label">Twitter / X</span></a></li>' : '') +
      '</ul>';
  }

  function renderSidebarNav() {
    var items = [
      { href: 'index.html',     label: 'Home',              page: 'home' },
      { href: 'about.html',     label: 'About Us',          page: 'about' },
      { href: 'teams.html',     label: 'Teams',             page: 'teams' },
      { href: 'register.html',  label: 'Register &amp; Pay',page: 'register' },
      { href: 'committee.html', label: 'Committee &amp; Staff', page: 'committee' },
      { href: 'news.html',      label: 'Club News',         page: 'news' },
      { href: 'gallery.html',   label: 'Gallery',           page: 'gallery' },
      { href: 'matchday.html',  label: 'Matchday Info',     page: 'matchday' },
      { href: 'contact.html',   label: 'Contact',           page: 'contact' }
    ];
    var out = '<header class="major"><h2>Menu</h2></header><ul>';
    items.forEach(function (item) {
      var active = (item.page === PAGE) ? ' class="active"' : '';
      out += '<li' + active + '><a href="' + item.href + '">' + item.label + '</a></li>';
    });
    out += '</ul>';
    return out;
  }

  function renderFixtureCard(fixture) {
    if (!fixture) return '';
    return '<header class="major"><h2>Next Fixture</h2></header>' +
      '<div class="mini-posts"><article><div class="fixture-card">' +
        '<p class="fixture-comp">' + esc(fixture.competition) + '</p>' +
        '<h4>' + esc(fixture.homeTeam) + '<br /><span class="vs-text">vs</span><br />' + esc(fixture.awayTeam) + '</h4>' +
        '<p class="fixture-details">' +
          '<span class="icon solid fa-calendar-alt"></span> ' + esc(fixture.date) + '<br />' +
          '<span class="icon solid fa-clock"></span> ' + esc(fixture.kickoff) + '<br />' +
          '<span class="icon solid fa-map-marker-alt"></span> ' + esc(fixture.venue) +
        '</p></div></article></div>';
  }

  function renderSidebarContact(club) {
    return '<header class="major"><h2>Get in Touch</h2></header>' +
      '<p>Interested in playing, sponsoring, or just coming to watch? We\'d love to hear from you.</p>' +
      '<ul class="contact">' +
        '<li class="icon solid fa-envelope"><a href="mailto:' + esc(club.email) + '">' + esc(club.email) + '</a></li>' +
        '<li class="icon solid fa-map-marker-alt">' + esc(club.address.line1) + '<br />' + esc(club.address.line2) + '<br />' + esc(club.address.postcode) + '</li>' +
      '</ul>';
  }

  /* ── Page content dispatch ── */

  function renderPageContent(page, data) {
    switch (page) {
      case 'home':      return renderHomePage(data.club);
      case 'about':     return renderAboutPage(data.club);
      case 'teams':     return renderTeamsPage(data.teams);
      case 'register':  return renderRegisterPage(data.registration);
      case 'committee': return renderCommitteePage(data.committee, data.teams);
      case 'news':      return renderNewsPage(data.news);
      case 'gallery':   return renderGalleryPage(data.gallery);
      case 'matchday':  return renderMatchdayPage(data.matchday);
      case 'contact':   return renderContactPage(data.club);
      default:          return '<p>Page not found.</p>';
    }
  }

  /* ── Page titles ── */

  var PAGE_TITLES = {
    home: '',
    about: 'About Us',
    teams: 'Our Teams',
    register: 'Register & Pay',
    committee: 'Committee & Staff',
    news: 'Club News',
    gallery: 'Gallery',
    matchday: 'Matchday Info',
    contact: 'Contact'
  };

  /* ── Init ── */

  function init() {
    Promise.all([
      load('club.json'),
      load('teams.json'),
      load('committee.json'),
      load('registration.json'),
      load('news.json'),
      load('fixtures.json'),
      load('gallery.json'),
      load('matchday.json')
    ]).then(function (results) {
      var data = {
        club:         results[0],
        teams:        results[1],
        committee:    results[2],
        registration: results[3],
        news:         results[4],
        fixtures:     results[5],
        gallery:      results[6],
        matchday:     results[7]
      };

      var el = function (id) { return document.getElementById(id); };

      el('header-bar').innerHTML       = renderHeader(data.club);
      el('page-content').innerHTML     = renderPageContent(PAGE, data);
      el('menu').innerHTML             = renderSidebarNav();
      el('sidebar-fixture').innerHTML  = renderFixtureCard(data.fixtures.next);
      el('sidebar-contact').innerHTML  = renderSidebarContact(data.club);
      el('footer-copy').textContent    = '\u00A9 ' + new Date().getFullYear() + ' ' + data.club.name + '. All rights reserved. Est. ' + data.club.founded + '.';

      var subtitle = PAGE_TITLES[PAGE];
      document.title = subtitle
        ? subtitle + ' — ' + data.club.name
        : data.club.name + ' — ' + data.club.tagline;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
