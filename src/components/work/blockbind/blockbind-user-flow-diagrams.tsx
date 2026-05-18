import type { ReactNode } from "react";

/**
 * Eleven interactive user-flow diagrams (nodes + empty SVG for connector paths).
 * IDs f1–f11 and node ids must stay stable for connector routing.
 */
export const blockbindUserFlowDiagrams: ReactNode[] = [
  <div key="f1" id="f1" className="flow wide">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div id="n1-splash" className="node node--terminal c2 r1">
        App Launch
      </div>
      <div id="n1-welcome" className="node c2 r2" data-to="n1-onb">
        Welcome
      </div>
      <div id="n1-onb" className="node c2 r3" data-to="n1-auth">
        Onboarding Slides
      </div>
      <div
        id="n1-auth"
        className="node node--decision c2 r4"
        data-to="n1-create,n1-import,n1-unlock"
      >
        Auth path
      </div>
      <div id="n1-create" className="node c1 r5" data-to="n1-pin">
        Create new wallet
      </div>
      <div id="n1-import" className="node c2 r5" data-to="n1-seed">
        Import wallet
      </div>
      <div id="n1-unlock" className="node c3 r5" data-to="n1-pwd">
        Unlock existing
      </div>
      <div id="n1-pin" className="node c1 r6" data-to="n1-gen">
        Set PIN / biometric
      </div>
      <div id="n1-seed" className="node c2 r6" data-to="n1-validate">
        Enter recovery phrase
      </div>
      <div id="n1-pwd" className="node c3 r6" data-to="n1-check">
        Password / biometric
      </div>
      <div id="n1-gen" className="node c1 r7" data-to="n1-backup">
        Generate phrase
      </div>
      <div
        id="n1-validate"
        className="node node--decision c2 r7"
        data-to="n1-ready,n1-err-auth:dashed"
      >
        Valid?
      </div>
      <div
        id="n1-check"
        className="node node--decision c3 r7"
        data-to="n1-ready,n1-err-auth:dashed"
      >
        Verified?
      </div>
      <div id="n1-backup" className="node c1 r8" data-to="n1-confirm">
        Backup phrase
      </div>
      <div id="n1-err-auth" className="node node--error c3 r8" data-to="n1-unlock:dashed">
        Auth failed
      </div>
      <div id="n1-confirm" className="node c1 r9" data-to="n1-ready">
        Confirm phrase
      </div>
      <div id="n1-ready" className="node node--success c2 r10" data-to="n1-home">
        Wallet ready
      </div>
      <div id="n1-home" className="node node--terminal c2 r11">
        → Home
      </div>
    </div>
  </div>,

  <div key="f2" id="f2" className="flow">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div
        id="n2-home"
        className="node node--terminal r1"
        style={{
          gridColumn: "1 / -1",
          justifySelf: "center",
          width: 360,
          padding: "12px 20px",
          flexDirection: "column",
          gap: 4,
          lineHeight: 1.25,
        }}
        data-to="n2-wallet-sel,n2-recv,n2-buy,n2-send,n2-settings,n2-nav,n2-qr"
      >
        <span>Home / Wallet Dashboard</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            opacity: 0.7,
            textTransform: "uppercase",
          }}
        >
          Balance · Portfolio · Tokens
        </span>
      </div>

      <div id="n2-wallet-sel" className="node r3" style={{ gridColumn: 1 }}>
        Wallet selector
      </div>
      <div id="n2-recv" className="node r3" style={{ gridColumn: 2 }}>
        Receive
      </div>
      <div id="n2-buy" className="node r3" style={{ gridColumn: 3 }}>
        Buy
      </div>
      <div id="n2-send" className="node r3" style={{ gridColumn: 4 }}>
        Send
      </div>
      <div id="n2-settings" className="node r3" style={{ gridColumn: 5 }}>
        Settings
      </div>
      <div id="n2-nav" className="node node--system r3" style={{ gridColumn: 6 }}>
        Bottom navigation
      </div>
      <div id="n2-qr" className="node r3" style={{ gridColumn: 7 }}>
        QR · Quick pay
      </div>
    </div>
  </div>,

  <div key="f3" id="f3" className="flow">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div
        id="n3-nav"
        className="node node--system r1"
        style={{ gridColumn: "2 / span 2" }}
        data-to="n3-home,n3-nfts,n3-swap,n3-activity"
      >
        Bottom Navigation
      </div>
      <div id="n3-home" className="node r3" style={{ gridColumn: 1 }}>
        Home
      </div>
      <div id="n3-nfts" className="node r3" style={{ gridColumn: 2 }}>
        NFTs · Tokens
      </div>
      <div id="n3-swap" className="node r3" style={{ gridColumn: 3 }}>
        Swap
      </div>
      <div id="n3-activity" className="node r3" style={{ gridColumn: 4 }}>
        Activity
      </div>
    </div>
  </div>,

  <div key="f4" id="f4" className="flow wide">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div id="n4-home" className="node node--terminal c2 r1" data-to="n4-tap">
        Home
      </div>
      <div id="n4-tap" className="node c2 r2" data-to="n4-pick">
        Tap Receive
      </div>
      <div id="n4-pick" className="node c2 r3" data-to="n4-qr">
        Select asset / wallet
      </div>
      <div id="n4-qr" className="node c2 r4" data-to="n4-addr">
        Show QR code
      </div>
      <div id="n4-addr" className="node c2 r5" data-to="n4-action">
        Show wallet address
      </div>
      <div
        id="n4-action"
        className="node node--decision c2 r6"
        data-to="n4-copy,n4-share,n4-cancel:dashed"
      >
        User action
      </div>
      <div id="n4-copy" className="node c1 r7" data-to="n4-copy-ok">
        Copy address
      </div>
      <div id="n4-share" className="node c2 r7" data-to="n4-share-res">
        Share address
      </div>
      <div id="n4-cancel" className="node c3 r7" data-to="n4-back:dashed">
        Cancel
      </div>
      <div id="n4-copy-ok" className="node node--success c1 r8" data-to="n4-addr:dashed">
        Copied · stay
      </div>
      <div
        id="n4-share-res"
        className="node node--decision c2 r8"
        data-to="n4-share-ok,n4-share-err"
      >
        Share OK?
      </div>
      <div id="n4-share-ok" className="node node--success c2 r9" data-to="n4-back">
        Shared
      </div>
      <div id="n4-share-err" className="node node--error c3 r9" data-to="n4-share:dashed">
        Share failed · retry
      </div>
      <div id="n4-back" className="node node--terminal c2 r10">
        → Home
      </div>
    </div>
  </div>,

  <div key="f5" id="f5" className="flow wide">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div id="n5-home" className="node node--terminal c2 r1" data-to="n5-tap">
        Home
      </div>
      <div id="n5-tap" className="node c2 r2" data-to="n5-asset">
        Tap Buy
      </div>
      <div id="n5-asset" className="node c2 r3" data-to="n5-amount">
        Select asset
      </div>
      <div id="n5-amount" className="node c2 r4" data-to="n5-method">
        Enter amount
      </div>
      <div id="n5-method" className="node c2 r5" data-to="n5-provider-ok">
        Payment method · Provider
      </div>
      <div
        id="n5-provider-ok"
        className="node node--decision c2 r6"
        data-to="n5-review,n5-no-provider"
      >
        Provider available?
      </div>
      <div id="n5-no-provider" className="node node--error c3 r7" data-to="n5-home:dashed">
        Provider unavailable
      </div>
      <div id="n5-review" className="node c2 r7" data-to="n5-confirm">
        Review fees
      </div>
      <div id="n5-confirm" className="node c2 r8" data-to="n5-result">
        Confirm purchase
      </div>
      <div
        id="n5-result"
        className="node node--decision c2 r9"
        data-to="n5-success,n5-fail,n5-cancel:dashed"
      >
        Payment result
      </div>
      <div id="n5-cancel" className="node node--error c1 r10" data-to="n5-review:dashed">
        Cancelled
      </div>
      <div id="n5-success" className="node node--success c2 r10" data-to="n5-end">
        Purchase confirmed
      </div>
      <div id="n5-fail" className="node node--error c3 r10" data-to="n5-method:dashed">
        Payment failed · retry
      </div>
      <div id="n5-end" className="node node--terminal c2 r11">
        → Home
      </div>
    </div>
  </div>,

  <div key="f6" id="f6" className="flow wide">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div id="n6-home" className="node node--terminal c2 r1" data-to="n6-tap">
        Home
      </div>
      <div id="n6-tap" className="node c2 r2" data-to="n6-recipient">
        Tap Send
      </div>
      <div id="n6-recipient" className="node c2 r3" data-to="n6-addr-ok">
        Recipient address
      </div>
      <div id="n6-addr-ok" className="node node--decision c2 r4" data-to="n6-token,n6-addr-err">
        Address valid?
      </div>
      <div id="n6-addr-err" className="node node--error c3 r5" data-to="n6-recipient:dashed">
        Invalid address
      </div>
      <div id="n6-token" className="node c2 r5" data-to="n6-amount">
        Select token
      </div>
      <div id="n6-amount" className="node c2 r6" data-to="n6-bal-ok">
        Enter amount
      </div>
      <div id="n6-bal-ok" className="node node--decision c2 r7" data-to="n6-network,n6-bal-err">
        Sufficient balance?
      </div>
      <div id="n6-bal-err" className="node node--error c3 r8" data-to="n6-amount:dashed">
        Insufficient balance
      </div>
      <div id="n6-network" className="node c2 r8" data-to="n6-net-ok">
        Select network
      </div>
      <div id="n6-net-ok" className="node node--decision c2 r9" data-to="n6-review,n6-net-err">
        Network match?
      </div>
      <div id="n6-net-err" className="node node--error c3 r10" data-to="n6-network:dashed">
        Network mismatch
      </div>
      <div id="n6-review" className="node c2 r10" data-to="n6-swipe">
        Review gas &amp; fees
      </div>
      <div id="n6-swipe" className="node c2 r11" data-to="n6-tx">
        Swipe to confirm
      </div>
      <div
        id="n6-tx"
        className="node node--decision c2 r12"
        data-to="n6-success,n6-fail,n6-user-cancel:dashed"
      >
        Tx result
      </div>
      <div id="n6-user-cancel" className="node node--error c1 r13" data-to="n6-end:dashed">
        User cancels
      </div>
      <div id="n6-success" className="node node--success c2 r13" data-to="n6-end">
        Sent · tx hash
      </div>
      <div id="n6-fail" className="node node--error c3 r13" data-to="n6-swipe:dashed">
        Tx failed · retry
      </div>
      <div id="n6-end" className="node node--terminal c2 r14">
        → Home / Activity
      </div>
    </div>
  </div>,

  <div key="f7" id="f7" className="flow wide">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div id="n7-tab" className="node node--terminal c2 r1" data-to="n7-pair">
        Swap tab
      </div>
      <div id="n7-pair" className="node c2 r2" data-to="n7-amount">
        Select token pair
      </div>
      <div id="n7-amount" className="node c2 r3" data-to="n7-quote">
        Enter amount
      </div>
      <div id="n7-quote" className="node node--system c2 r4" data-to="n7-review">
        Fetch rate · gas
      </div>
      <div id="n7-review" className="node c2 r5" data-to="n7-swipe">
        Review rate · slippage
      </div>
      <div id="n7-swipe" className="node c2 r6" data-to="n7-result">
        Swipe to confirm
      </div>
      <div id="n7-result" className="node node--decision c2 r7" data-to="n7-success,n7-fail">
        Swap result
      </div>
      <div id="n7-success" className="node node--success c1 r8" data-to="n7-end">
        Swap confirmed
      </div>
      <div id="n7-fail" className="node node--error c3 r8" data-to="n7-review:dashed">
        Swap failed
      </div>
      <div id="n7-end" className="node node--terminal c2 r9">
        → Activity
      </div>
    </div>
  </div>,

  <div key="f8" id="f8" className="flow">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div id="n8-tab" className="node node--terminal c2 r1" data-to="n8-list">
        NFTs · Tokens tab
      </div>
      <div id="n8-list" className="node c2 r2" data-to="n8-toggle">
        Browse holdings
      </div>
      <div id="n8-toggle" className="node node--decision c2 r3" data-to="n8-nft,n8-token">
        View type
      </div>
      <div id="n8-nft" className="node c1 r4" data-to="n8-detail">
        NFT detail
      </div>
      <div id="n8-token" className="node c3 r4" data-to="n8-manage">
        Token detail
      </div>
      <div id="n8-detail" className="node c1 r5" data-to="n8-end">
        View · transfer · hide
      </div>
      <div id="n8-manage" className="node c3 r5" data-to="n8-end">
        Send · Swap · hide
      </div>
      <div id="n8-end" className="node node--terminal c2 r6">
        → Home
      </div>
    </div>
  </div>,

  <div key="f9" id="f9" className="flow">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div id="n9-tab" className="node node--terminal c2 r1" data-to="n9-list">
        Activity tab
      </div>
      <div id="n9-list" className="node c2 r2" data-to="n9-action">
        Transaction timeline
      </div>
      <div
        id="n9-action"
        className="node node--decision c2 r3"
        data-to="n9-search,n9-filter,n9-detail"
      >
        User action
      </div>
      <div id="n9-search" className="node c1 r4" data-to="n9-list:dashed">
        Search transactions
      </div>
      <div id="n9-filter" className="node c2 r4" data-to="n9-list:dashed">
        Filter (type · token)
      </div>
      <div id="n9-detail" className="node c3 r4" data-to="n9-explorer">
        Tx detail
      </div>
      <div id="n9-explorer" className="node node--system c3 r5" data-to="n9-end">
        View on explorer
      </div>
      <div id="n9-end" className="node node--terminal c2 r6">
        → Home
      </div>
    </div>
  </div>,

  <div key="f10" id="f10" className="flow wide">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div id="n10-home" className="node node--terminal c2 r1" data-to="n10-tap">
        Home
      </div>
      <div id="n10-tap" className="node c2 r2" data-to="n10-settings">
        Tap Settings
      </div>
      <div
        id="n10-settings"
        className="node c2 r3"
        data-to="n10-wallets,n10-security,n10-apps,n10-backup,n10-notif"
      >
        Settings menu
      </div>
      <div id="n10-wallets" className="node c1 r5" data-to="n10-end">
        Multi-wallet mgmt
      </div>
      <div id="n10-security" className="node c2 r5" data-to="n10-auth-req">
        Security prefs
      </div>
      <div id="n10-apps" className="node c3 r5" data-to="n10-revoke">
        Connected apps
      </div>
      <div id="n10-backup" className="node c1 r7" data-to="n10-end">
        Backup · recovery
      </div>
      <div
        id="n10-auth-req"
        className="node node--decision c2 r6"
        data-to="n10-saved,n10-auth-cancel:dashed"
      >
        Re-auth required
      </div>
      <div
        id="n10-revoke"
        className="node node--decision c3 r6"
        data-to="n10-revoked,n10-revoke-cancel:dashed"
      >
        Confirm revoke?
      </div>
      <div id="n10-notif" className="node c2 r7" data-to="n10-end">
        Notifications
      </div>
      <div id="n10-saved" className="node node--success c2 r8" data-to="n10-settings:dashed">
        Saved
      </div>
      <div id="n10-auth-cancel" className="node node--error c1 r8" data-to="n10-security:dashed">
        Auth cancelled
      </div>
      <div id="n10-revoked" className="node node--success c3 r7" data-to="n10-apps:dashed">
        Revoked
      </div>
      <div id="n10-revoke-cancel" className="node node--error c3 r8" data-to="n10-apps:dashed">
        Cancelled
      </div>
      <div id="n10-end" className="node node--terminal c2 r10">
        → Home
      </div>
    </div>
  </div>,

  <div key="f11" id="f11" className="flow wide">
    <svg className="connectors" aria-hidden />
    <div className="flow-grid">
      <div
        id="n11-any"
        className="node node--terminal c2 r1"
        data-to="n11-offline,n11-locked,n11-update,n11-rpc,n11-perms,n11-deeplink"
      >
        Any screen
      </div>
      <div id="n11-offline" className="node node--error c1 r3" data-to="n11-resume">
        Offline / no network
      </div>
      <div id="n11-locked" className="node node--error c2 r3" data-to="n11-reauth">
        Session locked
      </div>
      <div id="n11-update" className="node node--system c3 r3" data-to="n11-resume">
        Force update
      </div>
      <div id="n11-rpc" className="node node--error c1 r5" data-to="n11-resume">
        RPC / node error
      </div>
      <div id="n11-perms" className="node node--system c2 r5" data-to="n11-resume">
        Permissions denied
      </div>
      <div id="n11-deeplink" className="node node--system c3 r5" data-to="n11-resume">
        Deeplink intent
      </div>
      <div id="n11-reauth" className="node c2 r6" data-to="n11-resume">
        Re-auth (PIN / biometric)
      </div>
      <div id="n11-resume" className="node node--success c2 r8">
        Resume last screen
      </div>
    </div>
  </div>,
];
