// ─────────────────────────────────────────────────────────────────────────────
// Orbit Tech — Email Templates
// All templates use inline styles for maximum email-client compatibility.
// Brand palette: Steel #4B8EBA · Golden #F6B93B · Slate #2C3A47 · Cream #F0E5DF
// ─────────────────────────────────────────────────────────────────────────────

const YEAR = new Date().getFullYear();

function base(schoolName: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Orbit Library</title>
</head>
<body style="margin:0;padding:0;background:#F0E5DF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F0E5DF;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px">

        <!-- Header -->
        <tr><td style="background:#2C3A47;padding:24px 32px;border-radius:16px 16px 0 0">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <div style="font-size:20px;font-weight:800;color:#F0E5DF;letter-spacing:-0.4px;line-height:1">Orbit</div>
                <div style="font-size:9px;font-weight:600;color:rgba(240,229,223,0.45);letter-spacing:2.5px;text-transform:uppercase;margin-top:3px">Library Management System</div>
              </td>
              <td align="right">
                <div style="font-size:12px;color:rgba(240,229,223,0.5)">${schoolName}</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px">
          ${content}

          <!-- Footer -->
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(44,58,71,0.08);text-align:center">
            <p style="margin:0;font-size:11px;color:rgba(44,58,71,0.4);line-height:1.6">
              Sent by ${schoolName} via Orbit Tech<br>
              © ${YEAR} Orbit Tech · Built for South African schools
            </p>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#2C3A47;letter-spacing:-0.5px">${text}</h1>`;
}

function para(text: string, muted = false): string {
  const color = muted ? 'rgba(44,58,71,0.55)' : '#2C3A47';
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${color}">${text}</p>`;
}

function bookCard(title: string, authors: string, extra?: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F0E5DF;border-radius:12px;margin:20px 0">
    <tr><td style="padding:16px 20px">
      <div style="font-size:13px;font-weight:700;color:#2C3A47">${title}</div>
      <div style="font-size:12px;color:rgba(44,58,71,0.55);margin-top:2px">${authors}</div>
      ${extra ? `<div style="font-size:12px;color:rgba(44,58,71,0.55);margin-top:4px">${extra}</div>` : ''}
    </td></tr>
  </table>`;
}

function infoRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:8px 0;font-size:13px;font-weight:600;color:rgba(44,58,71,0.5);width:140px">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:#2C3A47;font-weight:600">${value}</td>
  </tr>`;
}

function ctaButton(text: string, href: string): string {
  return `
  <div style="margin:24px 0">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#C4C0FB,#4B8EBA);color:white;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none">${text}</a>
  </div>`;
}

function alertBadge(text: string, type: 'warning' | 'danger' | 'success' | 'info'): string {
  const styles = {
    warning: 'background:#FEF3C7;color:#92400E;border:1px solid #FDE68A',
    danger:  'background:#FEE2E2;color:#991B1B;border:1px solid #FECACA',
    success: 'background:#D1FAE5;color:#065F46;border:1px solid #A7F3D0',
    info:    'background:#EFF6FF;color:#1E40AF;border:1px solid #BFDBFE',
  };
  return `<span style="${styles[type]};font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;display:inline-block;margin-bottom:12px">${text}</span>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Checkout Confirmation
// ─────────────────────────────────────────────────────────────────────────────

export function checkoutEmail(opts: {
  schoolName: string;
  memberName: string;
  bookTitle: string;
  authors: string;
  dueDate: string;
}): string {
  const content = `
    ${heading('Book Checked Out')}
    ${para(`Hi ${opts.memberName},`)}
    ${para('Your book has been successfully checked out from the school library.')}
    ${bookCard(opts.bookTitle, opts.authors)}
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px">
      ${infoRow('Due Date', opts.dueDate)}
      ${infoRow('Status', 'Checked Out')}
    </table>
    ${para('Please return the book on or before the due date to avoid late fines.', true)}
    ${para('Happy reading! 📚', true)}`;

  return base(opts.schoolName, content);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Return Confirmation
// ─────────────────────────────────────────────────────────────────────────────

export function returnEmail(opts: {
  schoolName: string;
  memberName: string;
  bookTitle: string;
  authors: string;
  returnedDate: string;
  fine?: number;
}): string {
  const content = `
    ${heading('Book Returned')}
    ${para(`Hi ${opts.memberName},`)}
    ${para('Thank you for returning your book to the library!')}
    ${bookCard(opts.bookTitle, opts.authors)}
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px">
      ${infoRow('Returned', opts.returnedDate)}
      ${opts.fine && opts.fine > 0 ? infoRow('Outstanding Fine', `R ${opts.fine.toFixed(2)}`) : ''}
    </table>
    ${opts.fine && opts.fine > 0
      ? para(`⚠️ You have an outstanding fine of <strong>R ${opts.fine.toFixed(2)}</strong>. Please settle it at the library desk.`)
      : para('No fines outstanding. Great job returning on time! ✅', true)}`;

  return base(opts.schoolName, content);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Overdue Notice
// ─────────────────────────────────────────────────────────────────────────────

export function overdueEmail(opts: {
  schoolName: string;
  memberName: string;
  bookTitle: string;
  authors: string;
  dueDate: string;
  daysOverdue: number;
  finePerDay?: number;
}): string {
  const fine = opts.finePerDay ? opts.finePerDay * opts.daysOverdue : 0;
  const content = `
    ${alertBadge(`${opts.daysOverdue} Day${opts.daysOverdue === 1 ? '' : 's'} Overdue`, 'danger')}
    ${heading('Overdue Book Notice')}
    ${para(`Hi ${opts.memberName},`)}
    ${para('This is a reminder that you have an overdue book. Please return it to the library as soon as possible.')}
    ${bookCard(opts.bookTitle, opts.authors, `Due ${opts.dueDate} · ${opts.daysOverdue} day${opts.daysOverdue === 1 ? '' : 's'} overdue`)}
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px">
      ${infoRow('Due Date', opts.dueDate)}
      ${infoRow('Days Overdue', String(opts.daysOverdue))}
      ${fine > 0 ? infoRow('Accrued Fine', `R ${fine.toFixed(2)}`) : ''}
    </table>
    ${para('Please visit the school library immediately to return the book and settle any outstanding fines.', true)}`;

  return base(opts.schoolName, content);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Due Date Reminder (2 days before)
// ─────────────────────────────────────────────────────────────────────────────

export function dueDateReminderEmail(opts: {
  schoolName: string;
  memberName: string;
  bookTitle: string;
  authors: string;
  dueDate: string;
  daysLeft: number;
}): string {
  const content = `
    ${alertBadge(`Due in ${opts.daysLeft} day${opts.daysLeft === 1 ? '' : 's'}`, 'warning')}
    ${heading('Return Reminder')}
    ${para(`Hi ${opts.memberName},`)}
    ${para(`Just a friendly reminder that your book is due back in <strong>${opts.daysLeft} day${opts.daysLeft === 1 ? '' : 's'}</strong>.`)}
    ${bookCard(opts.bookTitle, opts.authors)}
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px">
      ${infoRow('Due Date', opts.dueDate)}
      ${infoRow('Days Remaining', String(opts.daysLeft))}
    </table>
    ${para('Please return the book to the library on or before the due date to avoid any fines.', true)}`;

  return base(opts.schoolName, content);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Staff Invitation
// ─────────────────────────────────────────────────────────────────────────────

export function invitationEmail(opts: {
  schoolName: string;
  inviterName: string;
  inviteeEmail: string;
  role: string;
  signupUrl: string;
}): string {
  const content = `
    ${heading(`You're Invited to Join ${opts.schoolName}`)}
    ${para(`Hi there,`)}
    ${para(`<strong>${opts.inviterName}</strong> has invited you to join the Orbit Library Management System for <strong>${opts.schoolName}</strong> as a <strong>${opts.role}</strong>.`)}
    ${para('Orbit helps school libraries manage books, loans, and learner accounts — all in one place.')}
    ${ctaButton('Accept Invitation & Sign Up', opts.signupUrl)}
    ${para('If the button above doesn\'t work, copy and paste this link into your browser:', true)}
    <p style="font-size:13px;color:#4B8EBA;word-break:break-all;margin:0 0 16px">${opts.signupUrl}</p>
    ${para('This invitation was sent to <strong>' + opts.inviteeEmail + '</strong>. If you did not expect this invitation, you can safely ignore this email.', true)}`;

  return base(opts.schoolName, content);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Welcome Email
// ─────────────────────────────────────────────────────────────────────────────

export function welcomeEmail(opts: {
  schoolName: string;
  adminName: string;
  dashboardUrl: string;
}): string {
  const content = `
    ${heading(`Welcome to Orbit, ${opts.adminName}!`)}
    ${para(`Your library management system for <strong>${opts.schoolName}</strong> is ready.`)}

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F0E5DF;border-radius:12px;margin:20px 0">
      <tr><td style="padding:20px 24px">
        <div style="font-size:13px;font-weight:700;color:#2C3A47;margin-bottom:12px">Getting Started</div>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="padding:4px 0;font-size:13px;color:rgba(44,58,71,0.7)">📚</td><td style="padding:4px 0 4px 10px;font-size:13px;color:rgba(44,58,71,0.7)">Add your first books to the catalogue</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:rgba(44,58,71,0.7)">👥</td><td style="padding:4px 0 4px 10px;font-size:13px;color:rgba(44,58,71,0.7)">Register your learners</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:rgba(44,58,71,0.7)">📖</td><td style="padding:4px 0 4px 10px;font-size:13px;color:rgba(44,58,71,0.7)">Start checking out books</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:rgba(44,58,71,0.7)">⚙️</td><td style="padding:4px 0 4px 10px;font-size:13px;color:rgba(44,58,71,0.7)">Configure loan periods and fines in Settings</td></tr>
        </table>
      </td></tr>
    </table>

    ${ctaButton('Go to Mission Control', opts.dashboardUrl)}
    ${para('If you have any questions, reply to this email and our team will help you.', true)}`;

  return base(opts.schoolName, content);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Weekly Library Summary
// ─────────────────────────────────────────────────────────────────────────────

export function weeklySummaryEmail(opts: {
  schoolName: string;
  adminName: string;
  weekOf: string;
  totalLoans: number;
  newLoans: number;
  returnedThisWeek: number;
  overdueCount: number;
  newBooks: number;
  newMembers: number;
  topBooks: { title: string; checkouts: number }[];
  dashboardUrl: string;
}): string {
  const statCard = (label: string, value: number | string, colour: string) => `
    <td style="text-align:center;padding:16px 12px;background:white;border-radius:12px;width:25%">
      <div style="font-size:24px;font-weight:800;color:${colour}">${value}</div>
      <div style="font-size:11px;color:rgba(44,58,71,0.5);margin-top:4px">${label}</div>
    </td>`;

  const topBooksRows = opts.topBooks.slice(0, 5).map((b, i) =>
    `<tr><td style="padding:6px 0;font-size:13px;color:rgba(44,58,71,0.4);width:24px">${i + 1}.</td>
     <td style="padding:6px 0;font-size:13px;color:#2C3A47">${b.title}</td>
     <td style="padding:6px 0;font-size:12px;color:#4B8EBA;text-align:right">${b.checkouts} checkouts</td></tr>`
  ).join('');

  const content = `
    ${heading(`Weekly Library Summary`)}
    ${para(`Hi ${opts.adminName}, here's your library report for the week of <strong>${opts.weekOf}</strong>.`)}

    <!-- Stats grid -->
    <table width="100%" cellpadding="4" cellspacing="0" role="presentation" style="background:#F0E5DF;border-radius:16px;padding:12px;margin:20px 0">
      <tr>
        ${statCard('Active Loans', opts.totalLoans, '#4B8EBA')}
        ${statCard('New This Week', opts.newLoans, '#A29FEC')}
        ${statCard('Returned', opts.returnedThisWeek, '#22c55e')}
        ${statCard('Overdue', opts.overdueCount, opts.overdueCount > 0 ? '#ef4444' : '#22c55e')}
      </tr>
    </table>

    <!-- New additions -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px">
      ${infoRow('New Books Added', String(opts.newBooks))}
      ${infoRow('New Members', String(opts.newMembers))}
    </table>

    ${opts.topBooks.length > 0 ? `
    <div style="font-size:13px;font-weight:700;color:#2C3A47;margin-bottom:8px">Most Popular Books</div>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px">
      ${topBooksRows}
    </table>` : ''}

    ${opts.overdueCount > 0
      ? para(`⚠️ You have <strong>${opts.overdueCount} overdue loan${opts.overdueCount === 1 ? '' : 's'}</strong> that need attention.`)
      : para('✅ No overdue loans this week!', true)}

    ${ctaButton('View Full Dashboard', opts.dashboardUrl)}`;

  return base(opts.schoolName, content);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Monthly Overdue Report
// ─────────────────────────────────────────────────────────────────────────────

export function monthlyOverdueReport(opts: {
  schoolName: string;
  adminName: string;
  month: string;
  loans: { memberName: string; memberNumber: string; bookTitle: string; dueDate: string; daysOverdue: number }[];
  dashboardUrl: string;
}): string {
  const rows = opts.loans.map(l => `
    <tr style="border-bottom:1px solid rgba(44,58,71,0.06)">
      <td style="padding:10px 8px;font-size:13px;color:#2C3A47">${l.memberName}</td>
      <td style="padding:10px 8px;font-size:12px;color:rgba(44,58,71,0.5)">${l.memberNumber}</td>
      <td style="padding:10px 8px;font-size:13px;color:#2C3A47">${l.bookTitle}</td>
      <td style="padding:10px 8px;font-size:12px;color:rgba(44,58,71,0.5)">${l.dueDate}</td>
      <td style="padding:10px 8px;font-size:12px;color:#ef4444;font-weight:700;text-align:right">${l.daysOverdue}d</td>
    </tr>`
  ).join('');

  const content = `
    ${alertBadge(`${opts.loans.length} Overdue Loan${opts.loans.length === 1 ? '' : 's'}`, opts.loans.length > 0 ? 'danger' : 'success')}
    ${heading(`Monthly Overdue Report — ${opts.month}`)}
    ${para(`Hi ${opts.adminName},`)}
    ${opts.loans.length === 0
      ? para('🎉 Great news — no overdue loans this month!')
      : para(`There are <strong>${opts.loans.length}</strong> overdue loans as of today. Please follow up with the learners listed below.`)}

    ${opts.loans.length > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;border-collapse:collapse">
      <thead>
        <tr style="background:#F0E5DF">
          <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;color:rgba(44,58,71,0.5);text-transform:uppercase;letter-spacing:1px">Learner</th>
          <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;color:rgba(44,58,71,0.5);text-transform:uppercase;letter-spacing:1px">Number</th>
          <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;color:rgba(44,58,71,0.5);text-transform:uppercase;letter-spacing:1px">Book</th>
          <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;color:rgba(44,58,71,0.5);text-transform:uppercase;letter-spacing:1px">Due</th>
          <th style="padding:10px 8px;text-align:right;font-size:11px;font-weight:700;color:rgba(44,58,71,0.5);text-transform:uppercase;letter-spacing:1px">Days</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>` : ''}

    ${ctaButton('Manage Loans in Dashboard', opts.dashboardUrl)}`;

  return base(opts.schoolName, content);
}
