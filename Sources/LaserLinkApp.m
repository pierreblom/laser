#import <Cocoa/Cocoa.h>
#import <CoreBluetooth/CoreBluetooth.h>

static NSString *const LaserTargetName = @"Laser-22504";

@interface LaserApp : NSObject <NSApplicationDelegate, CBCentralManagerDelegate, CBPeripheralDelegate,
                               NSTableViewDataSource, NSTableViewDelegate, NSWindowDelegate>
@property (nonatomic, strong) CBCentralManager *central;
@property (nonatomic, strong) NSMutableArray<NSMutableDictionary *> *devices;
@property (nonatomic, strong) NSMutableArray<NSString *> *events;
@property (nonatomic, strong) NSWindow *window;
@property (nonatomic, strong) NSTextField *statusLabel;
@property (nonatomic, strong) NSTableView *deviceTable;
@property (nonatomic, strong) NSTextView *detailsView;
@property (nonatomic, strong) NSButton *scanButton;
@property (nonatomic, strong) NSButton *connectButton;
@property (nonatomic, strong) NSButton *startButton;
@property (nonatomic, strong) NSButton *pauseButton;
@property (nonatomic, strong) NSButton *abortButton;
@property (nonatomic, strong) NSTextField *jobLabel;
@property (nonatomic, strong) NSTextField *jobStatusLabel;
@property (nonatomic, strong) NSProgressIndicator *jobProgress;
@property (nonatomic, strong) CBPeripheral *selectedPeripheral;
@property (nonatomic, copy) NSString *status;
@property (nonatomic) NSUInteger scanGeneration;
@property (nonatomic) BOOL autoConnectAttempted;
@property (nonatomic) BOOL statusProbeSent;
@property (nonatomic, strong) CBCharacteristic *commandCharacteristic;
@property (nonatomic, strong) NSArray<NSString *> *jobLines;
@property (nonatomic, strong) NSURL *jobURL;
@property (nonatomic, strong) NSMutableString *responseBuffer;
@property (nonatomic, strong) NSData *currentLineData;
@property (nonatomic) NSUInteger jobIndex;
@property (nonatomic) NSUInteger lineWriteOffset;
@property (nonatomic) NSUInteger lineGeneration;
@property (nonatomic) BOOL writeOutstanding;
@property (nonatomic) BOOL lineAckReceived;
@property (nonatomic) BOOL jobRunning;
@property (nonatomic) BOOL jobPaused;
@property (nonatomic) BOOL grblVerified;
@property (nonatomic) BOOL readOnlyProbeSent;
@property (nonatomic) BOOL probeWriteOutstanding;
@property (nonatomic) BOOL probeReplyOkay;
@property (nonatomic) BOOL statusWriteOutstanding;
@property (nonatomic) BOOL awaitingIdle;
@property (nonatomic) BOOL selfTesting;
@property (nonatomic, strong) NSUUID *verifiedPeripheralID;
@property (nonatomic, strong) NSUUID *targetPeripheralID;
@end

@implementation LaserApp

- (void)applicationDidFinishLaunching:(NSNotification *)notification {
    self.devices = [NSMutableArray array];
    self.events = [NSMutableArray array];
    self.responseBuffer = [NSMutableString string];
    self.status = @"Starting Bluetooth…";
    [self makeWindow];
    self.central = [[CBCentralManager alloc] initWithDelegate:self queue:dispatch_get_main_queue()];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
    return YES;
}

- (NSApplicationTerminateReply)applicationShouldTerminate:(NSApplication *)sender {
    if (!self.jobRunning) return NSTerminateNow;
    NSAlert *alert = [[NSAlert alloc] init];
    alert.messageText = @"Job is still active";
    alert.informativeText = @"Keep Laser Link open until the machine is idle, or abort the job and check the machine before quitting.";
    [alert addButtonWithTitle:@"Keep App Open"];
    [alert runModal];
    return NSTerminateCancel;
}

- (BOOL)windowShouldClose:(NSWindow *)window {
    if (!self.jobRunning) return YES;
    NSAlert *alert = [[NSAlert alloc] init];
    alert.messageText = @"Job is still active";
    alert.informativeText = @"Keep Laser Link open until the machine is idle, or abort the job and check the machine before closing this window.";
    [alert addButtonWithTitle:@"Keep App Open"];
    [alert runModal];
    return NO;
}

- (NSTextField *)label:(NSString *)text frame:(NSRect)frame size:(CGFloat)size bold:(BOOL)bold {
    NSTextField *label = [[NSTextField alloc] initWithFrame:frame];
    label.stringValue = text;
    label.editable = NO;
    label.selectable = YES;
    label.bezeled = NO;
    label.drawsBackground = NO;
    label.font = bold ? [NSFont boldSystemFontOfSize:size] : [NSFont systemFontOfSize:size];
    return label;
}

- (NSButton *)button:(NSString *)title frame:(NSRect)frame action:(SEL)action {
    NSButton *button = [[NSButton alloc] initWithFrame:frame];
    button.title = title;
    button.bezelStyle = NSBezelStyleRounded;
    button.target = self;
    button.action = action;
    return button;
}

- (void)makeWindow {
    NSRect frame = NSMakeRect(0, 0, 800, 690);
    self.window = [[NSWindow alloc] initWithContentRect:frame
                                              styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable |
                                                        NSWindowStyleMaskMiniaturizable
                                                backing:NSBackingStoreBuffered defer:NO];
    self.window.title = @"Laser Link";
    self.window.delegate = self;
    [self.window center];
    NSView *content = self.window.contentView;

    [content addSubview:[self label:@"Laser Link" frame:NSMakeRect(20, 642, 500, 34) size:27 bold:YES]];
    [content addSubview:[self label:@"Laservii L1 Pro Bluetooth job sender"
                             frame:NSMakeRect(22, 622, 500, 20) size:13 bold:NO]];
    self.statusLabel = [self label:self.status frame:NSMakeRect(22, 588, 740, 22) size:13 bold:NO];
    [content addSubview:self.statusLabel];
    [content addSubview:[self label:@"Nearby devices" frame:NSMakeRect(22, 554, 280, 22) size:15 bold:YES]];
    [content addSubview:[self label:@"Device details" frame:NSMakeRect(340, 554, 400, 22) size:15 bold:YES]];

    NSScrollView *tableScroll = [[NSScrollView alloc] initWithFrame:NSMakeRect(20, 230, 300, 320)];
    tableScroll.hasVerticalScroller = YES;
    tableScroll.borderType = NSBezelBorder;
    self.deviceTable = [[NSTableView alloc] initWithFrame:tableScroll.bounds];
    self.deviceTable.delegate = self;
    self.deviceTable.dataSource = self;
    NSTableColumn *nameColumn = [[NSTableColumn alloc] initWithIdentifier:@"name"];
    nameColumn.title = @"Name";
    nameColumn.width = 220;
    [self.deviceTable addTableColumn:nameColumn];
    NSTableColumn *signalColumn = [[NSTableColumn alloc] initWithIdentifier:@"signal"];
    signalColumn.title = @"Signal";
    signalColumn.width = 70;
    [self.deviceTable addTableColumn:signalColumn];
    tableScroll.documentView = self.deviceTable;
    [content addSubview:tableScroll];

    NSScrollView *detailsScroll = [[NSScrollView alloc] initWithFrame:NSMakeRect(338, 230, 442, 320)];
    detailsScroll.hasVerticalScroller = YES;
    detailsScroll.borderType = NSBezelBorder;
    self.detailsView = [[NSTextView alloc] initWithFrame:detailsScroll.bounds];
    self.detailsView.editable = NO;
    self.detailsView.selectable = YES;
    self.detailsView.font = [NSFont monospacedSystemFontOfSize:11 weight:NSFontWeightRegular];
    self.detailsView.string = @"Select Laser-22504, then connect to inspect its services.";
    detailsScroll.documentView = self.detailsView;
    [content addSubview:detailsScroll];

    self.scanButton = [self button:@"Stop Scan" frame:NSMakeRect(20, 193, 125, 30) action:@selector(toggleScan:)];
    [content addSubview:self.scanButton];
    self.connectButton = [self button:@"Connect" frame:NSMakeRect(150, 193, 125, 30) action:@selector(toggleConnection:)];
    self.connectButton.enabled = NO;
    [content addSubview:self.connectButton];
    [content addSubview:[self button:@"Copy Bluetooth Report" frame:NSMakeRect(589, 193, 190, 30)
                                action:@selector(copyReport:)]];

    [content addSubview:[self label:@"Engraving job" frame:NSMakeRect(22, 158, 300, 22) size:15 bold:YES]];
    self.jobLabel = [self label:@"Open a LightBurn .nc or G-code file."
                           frame:NSMakeRect(22, 135, 750, 20) size:13 bold:NO];
    [content addSubview:self.jobLabel];
    [content addSubview:[self button:@"Open Job…" frame:NSMakeRect(20, 98, 115, 30) action:@selector(openJob:)]];
    self.startButton = [self button:@"Start Job" frame:NSMakeRect(145, 98, 115, 30) action:@selector(startJob:)];
    self.startButton.enabled = NO;
    [content addSubview:self.startButton];
    self.pauseButton = [self button:@"Pause" frame:NSMakeRect(270, 98, 115, 30) action:@selector(togglePause:)];
    self.pauseButton.enabled = NO;
    [content addSubview:self.pauseButton];
    self.abortButton = [self button:@"Abort" frame:NSMakeRect(395, 98, 115, 30) action:@selector(abortJob:)];
    self.abortButton.enabled = NO;
    [content addSubview:self.abortButton];
    self.jobProgress = [[NSProgressIndicator alloc] initWithFrame:NSMakeRect(22, 67, 475, 16)];
    self.jobProgress.indeterminate = NO;
    self.jobProgress.minValue = 0;
    [content addSubview:self.jobProgress];
    self.jobStatusLabel = [self label:@"No job loaded"
                                 frame:NSMakeRect(22, 40, 750, 20) size:12 bold:NO];
    [content addSubview:self.jobStatusLabel];
    [content addSubview:[self label:@"Starting a job will move and fire the laser. Watch the machine and keep its stop control accessible."
                             frame:NSMakeRect(22, 15, 750, 18) size:11 bold:NO]];
    [self.window makeKeyAndOrderFront:nil];
    [NSApp activateIgnoringOtherApps:YES];
}

- (void)setStatusText:(NSString *)message {
    self.status = message;
    self.statusLabel.stringValue = message;
    [self recordEvent:message];
}

- (void)recordEvent:(NSString *)message {
    [self.events addObject:[NSString stringWithFormat:@"%@: %@", [NSDate date], message]];
    if (self.events.count > 100) [self.events removeObjectAtIndex:0];
    [self writeReport];
}

- (NSString *)bluetoothReport {
    NSMutableString *report = [NSMutableString stringWithFormat:@"Laser Link Bluetooth report\nStatus: %@\n\n",
                               self.status];
    for (NSDictionary *device in self.devices) {
        if ([device[@"name"] caseInsensitiveCompare:LaserTargetName] != NSOrderedSame) continue;
        CBPeripheral *peripheral = device[@"peripheral"];
        [report appendFormat:@"Device: %@ | RSSI: %@ dBm | ID: %@\n",
         device[@"name"], device[@"rssi"], peripheral.identifier.UUIDString];
    }
    [report appendFormat:@"\nSelected device:\n%@\n\nEvents:\n", self.detailsView.string];
    [report appendString:[self.events componentsJoinedByString:@"\n"]];
    return report;
}

- (void)writeReport {
    NSString *directory = [[NSBundle mainBundle].bundlePath stringByDeletingLastPathComponent];
    NSString *path = [directory stringByAppendingPathComponent:@"bluetooth-report.txt"];
    [[self bluetoothReport] writeToFile:path atomically:YES encoding:NSUTF8StringEncoding error:nil];
}

- (void)startScan {
    if (self.central.state != CBManagerStatePoweredOn) {
        [self setStatusText:@"Bluetooth unavailable. Turn it on and allow Laser Link access."];
        return;
    }
    [self.central scanForPeripheralsWithServices:nil options:@{CBCentralManagerScanOptionAllowDuplicatesKey: @NO}];
    NSUInteger generation = ++self.scanGeneration;
    self.scanButton.title = @"Stop Scan";
    [self setStatusText:@"Scanning for nearby Bluetooth devices…"];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(20 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        if (generation == self.scanGeneration && self.central.isScanning) {
            [self.central stopScan];
            self.scanButton.title = @"Scan Again";
            [self setStatusText:@"Scan complete. Select a device or scan again."];
        }
    });
}

- (void)toggleScan:(id)sender {
    if (self.central.isScanning) {
        self.scanGeneration++;
        [self.central stopScan];
        self.scanButton.title = @"Scan Again";
        [self setStatusText:@"Scan stopped"];
    } else {
        [self startScan];
    }
}

- (void)toggleConnection:(id)sender {
    if (self.jobRunning) return;
    if (!self.selectedPeripheral) return;
    if (self.selectedPeripheral.state == CBPeripheralStateConnected) {
        [self.central cancelPeripheralConnection:self.selectedPeripheral];
    } else {
        self.scanGeneration++;
        [self.central stopScan];
        self.scanButton.title = @"Scan Again";
        self.selectedPeripheral.delegate = self;
        [self setStatusText:[NSString stringWithFormat:@"Connecting to %@…",
                             self.selectedPeripheral.name ?: @"device"]];
        [self.central connectPeripheral:self.selectedPeripheral options:nil];
    }
}

- (NSInteger)numberOfRowsInTableView:(NSTableView *)tableView {
    return self.devices.count;
}

- (id)tableView:(NSTableView *)tableView objectValueForTableColumn:(NSTableColumn *)tableColumn row:(NSInteger)row {
    NSDictionary *device = self.devices[(NSUInteger)row];
    if ([tableColumn.identifier isEqualToString:@"name"]) return device[@"name"];
    return [NSString stringWithFormat:@"%@ dBm", device[@"rssi"]];
}

- (void)tableViewSelectionDidChange:(NSNotification *)notification {
    NSInteger row = self.deviceTable.selectedRow;
    self.selectedPeripheral = row >= 0 ? self.devices[(NSUInteger)row][@"peripheral"] : nil;
    [self refreshDetails];
    [self updateJobControls];
}

- (void)refreshDetails {
    CBPeripheral *peripheral = self.selectedPeripheral;
    self.connectButton.enabled = peripheral != nil;
    self.connectButton.title = peripheral.state == CBPeripheralStateConnected ? @"Disconnect" : @"Connect";
    if (!peripheral) {
        self.detailsView.string = @"Select Laser-22504, then connect to inspect its services.";
        return;
    }
    NSMutableString *details = [NSMutableString stringWithFormat:@"Name: %@\nID: %@\nState: %@\n\n",
                                peripheral.name ?: @"Unnamed device", peripheral.identifier.UUIDString,
                                peripheral.state == CBPeripheralStateConnected ? @"Connected" : @"Not connected"];
    if (peripheral.services.count == 0) {
        [details appendString:@"No services discovered yet."];
    }
    for (CBService *service in peripheral.services) {
        [details appendFormat:@"Service %@\n", service.UUID.UUIDString];
        for (CBCharacteristic *characteristic in service.characteristics) {
            NSMutableArray<NSString *> *properties = [NSMutableArray array];
            if (characteristic.properties & CBCharacteristicPropertyRead) [properties addObject:@"read"];
            if (characteristic.properties & CBCharacteristicPropertyWrite) [properties addObject:@"write"];
            if (characteristic.properties & CBCharacteristicPropertyWriteWithoutResponse) [properties addObject:@"write without response"];
            if (characteristic.properties & CBCharacteristicPropertyNotify) [properties addObject:@"notify"];
            if (characteristic.properties & CBCharacteristicPropertyIndicate) [properties addObject:@"indicate"];
            [details appendFormat:@"  %@: %@\n", characteristic.UUID.UUIDString,
             properties.count ? [properties componentsJoinedByString:@", "] : @"other"];
            if (characteristic.value.length) {
                NSString *text = [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding];
                [details appendFormat:@"    Value: %@\n", text ?: characteristic.value.description];
            }
        }
        [details appendString:@"\n"];
    }
    self.detailsView.string = details;
}

- (void)copyReport:(id)sender {
    [[NSPasteboard generalPasteboard] clearContents];
    [[NSPasteboard generalPasteboard] setString:[self bluetoothReport] forType:NSPasteboardTypeString];
    [self setStatusText:@"Bluetooth report copied to clipboard"];
}

- (void)updateJobControls {
    BOOL connected = self.selectedPeripheral.state == CBPeripheralStateConnected &&
                     [self.selectedPeripheral.identifier isEqual:self.verifiedPeripheralID];
    self.startButton.enabled = connected && self.grblVerified && self.jobLines.count > 0 && !self.jobRunning;
    self.pauseButton.enabled = connected && self.jobRunning;
    self.abortButton.enabled = connected && self.jobRunning;
    self.connectButton.enabled = self.selectedPeripheral != nil && !self.jobRunning;
    self.pauseButton.title = self.jobPaused ? @"Resume" : @"Pause";
}

- (void)openJob:(id)sender {
    if (self.jobRunning) return;
    NSOpenPanel *panel = [NSOpenPanel openPanel];
    panel.title = @"Choose a G-code engraving job";
    panel.allowsMultipleSelection = NO;
    panel.canChooseDirectories = NO;
    if ([panel runModal] != NSModalResponseOK) return;
    NSURL *url = panel.URL;
    NSString *extension = url.pathExtension.lowercaseString;
    if (![@[@"nc", @"gc", @"gcode"] containsObject:extension]) {
        self.jobStatusLabel.stringValue = @"Choose an .nc, .gc, or .gcode file exported for this laser.";
        return;
    }
    NSDictionary *attributes = [[NSFileManager defaultManager] attributesOfItemAtPath:url.path error:nil];
    if ([attributes fileSize] > 20 * 1024 * 1024) {
        self.jobStatusLabel.stringValue = @"Job is over 20 MB; split it into smaller files.";
        return;
    }
    NSError *error = nil;
    NSString *contents = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:&error];
    if (!contents) {
        self.jobStatusLabel.stringValue = [NSString stringWithFormat:@"Could not read job: %@",
                                           error.localizedDescription ?: @"invalid UTF-8"];
        return;
    }
    NSMutableArray<NSString *> *lines = [NSMutableArray array];
    NSUInteger sourceLine = 0;
    for (NSString *raw in [contents componentsSeparatedByCharactersInSet:[NSCharacterSet newlineCharacterSet]]) {
        sourceLine++;
        NSString *line = [raw stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
        if (line.length == 0 || [line hasPrefix:@";"]) continue;
        NSData *bytes = [line dataUsingEncoding:NSASCIIStringEncoding allowLossyConversion:NO];
        if (!bytes || bytes.length > 254) {
            self.jobStatusLabel.stringValue = [NSString stringWithFormat:@"Unsupported G-code on line %lu.",
                                               (unsigned long)sourceLine];
            return;
        }
        [lines addObject:line];
    }
    if (lines.count == 0) {
        self.jobStatusLabel.stringValue = @"The selected file has no G-code commands.";
        return;
    }
    self.jobURL = url;
    self.jobLines = lines;
    self.jobLabel.stringValue = [NSString stringWithFormat:@"%@ — %lu commands", url.lastPathComponent,
                                 (unsigned long)lines.count];
    self.jobStatusLabel.stringValue = @"Ready. Preview the job in LightBurn before starting.";
    self.jobProgress.maxValue = lines.count;
    self.jobProgress.doubleValue = 0;
    [self recordEvent:[NSString stringWithFormat:@"Loaded %@ (%lu commands)", url.lastPathComponent,
                       (unsigned long)lines.count]];
    [self updateJobControls];
}

- (void)startJob:(id)sender {
    if (!self.startButton.enabled) return;
    NSAlert *alert = [[NSAlert alloc] init];
    alert.messageText = @"Start engraving?";
    alert.informativeText = [NSString stringWithFormat:@"Send %@ to Laser-22504? The laser will move and fire. Keep the area clear and watch the machine.",
                              self.jobURL.lastPathComponent];
    [alert addButtonWithTitle:@"Start Job"];
    [alert addButtonWithTitle:@"Cancel"];
    if ([alert runModal] != NSAlertFirstButtonReturn) return;
    self.jobRunning = YES;
    self.jobPaused = NO;
    self.awaitingIdle = NO;
    self.deviceTable.enabled = NO;
    self.jobIndex = 0;
    self.jobProgress.doubleValue = 0;
    self.jobStatusLabel.stringValue = @"Sending job…";
    [self recordEvent:[NSString stringWithFormat:@"Started job %@", self.jobURL.lastPathComponent]];
    [self updateJobControls];
    [self sendNextJobLine];
}

- (void)sendRealtimeByte:(uint8_t)value {
    if (!self.commandCharacteristic || self.selectedPeripheral.state != CBPeripheralStateConnected) return;
    NSData *data = [NSData dataWithBytes:&value length:1];
    [self.selectedPeripheral writeValue:data forCharacteristic:self.commandCharacteristic
                                   type:CBCharacteristicWriteWithoutResponse];
}

- (void)togglePause:(id)sender {
    if (!self.jobRunning) return;
    self.jobPaused = !self.jobPaused;
    [self sendRealtimeByte:self.jobPaused ? '!' : '~'];
    self.jobStatusLabel.stringValue = self.jobPaused ? @"Paused; waiting for the controller to hold." : @"Resuming…";
    [self recordEvent:self.jobPaused ? @"Feed hold requested" : @"Cycle resume requested"];
    [self updateJobControls];
    if (!self.jobPaused && !self.currentLineData && !self.awaitingIdle) [self sendNextJobLine];
}

- (void)abortJob:(id)sender {
    if (!self.jobRunning) return;
    BOOL wasSelfTesting = self.selfTesting;
    [self sendRealtimeByte:0x18];
    self.jobRunning = NO;
    self.jobPaused = NO;
    self.awaitingIdle = NO;
    self.grblVerified = NO;
    self.deviceTable.enabled = YES;
    self.currentLineData = nil;
    self.writeOutstanding = NO;
    self.lineGeneration++;
    self.jobStatusLabel.stringValue = @"Abort sent. Check the machine, then reconnect before another job.";
    if (wasSelfTesting) {
        self.selfTesting = NO;
        self.jobLines = nil;
        self.jobProgress.doubleValue = 0;
    }
    [self recordEvent:@"Job aborted; GRBL soft reset sent"];
    [self updateJobControls];
}

- (void)stopJobWithError:(NSString *)message {
    if (self.jobRunning) [self sendRealtimeByte:0x18];
    self.jobRunning = NO;
    self.jobPaused = NO;
    self.awaitingIdle = NO;
    self.grblVerified = NO;
    self.deviceTable.enabled = YES;
    self.currentLineData = nil;
    self.writeOutstanding = NO;
    self.lineGeneration++;
    self.jobStatusLabel.stringValue = message;
    if (self.selfTesting) {
        self.selfTesting = NO;
        self.jobLines = nil;
        self.jobProgress.doubleValue = 0;
    }
    [self recordEvent:message];
    [self updateJobControls];
}

- (void)sendNextJobLine {
    if (!self.jobRunning || self.jobPaused || self.currentLineData || self.awaitingIdle) return;
    if (self.jobIndex >= self.jobLines.count) {
        self.awaitingIdle = YES;
        self.jobStatusLabel.stringValue = @"All commands accepted. Waiting for the machine to become idle…";
        [self recordEvent:@"All job commands acknowledged"];
        [self pollForIdle];
        return;
    }
    NSString *line = [self.jobLines[self.jobIndex] stringByAppendingString:@"\n"];
    self.currentLineData = [line dataUsingEncoding:NSASCIIStringEncoding];
    self.lineWriteOffset = 0;
    self.writeOutstanding = NO;
    self.lineAckReceived = NO;
    NSUInteger generation = ++self.lineGeneration;
    [self writeNextChunk];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(60 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        if (self.jobRunning && self.currentLineData && generation == self.lineGeneration) {
            [self stopJobWithError:[NSString stringWithFormat:@"No controller reply for command %lu. Job stopped.",
                                    (unsigned long)(self.jobIndex + 1)]];
        }
    });
}

- (void)pollForIdle {
    if (!self.jobRunning || !self.awaitingIdle || self.selectedPeripheral.state != CBPeripheralStateConnected) return;
    [self sendRealtimeByte:'?'];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self pollForIdle];
    });
}

- (void)writeNextChunk {
    if (!self.jobRunning || !self.currentLineData || self.writeOutstanding) return;
    if (self.lineWriteOffset == self.currentLineData.length) {
        if (self.lineAckReceived) [self finishCurrentLine];
        return;
    }
    NSUInteger maxLength = [self.selectedPeripheral maximumWriteValueLengthForType:CBCharacteristicWriteWithResponse];
    NSUInteger length = MIN(MIN(maxLength, 128), self.currentLineData.length - self.lineWriteOffset);
    if (length == 0) {
        [self stopJobWithError:@"Bluetooth write size is zero. Job stopped."];
        return;
    }
    NSData *chunk = [self.currentLineData subdataWithRange:NSMakeRange(self.lineWriteOffset, length)];
    self.lineWriteOffset += length;
    self.writeOutstanding = YES;
    [self.selectedPeripheral writeValue:chunk forCharacteristic:self.commandCharacteristic
                                   type:CBCharacteristicWriteWithResponse];
}

- (void)finishCurrentLine {
    if (!self.jobRunning || !self.currentLineData || !self.lineAckReceived || self.writeOutstanding ||
        self.lineWriteOffset < self.currentLineData.length) return;
    self.currentLineData = nil;
    self.jobIndex++;
    self.jobProgress.doubleValue = self.jobIndex;
    self.jobStatusLabel.stringValue = [NSString stringWithFormat:@"Acknowledged %lu of %lu commands",
                                       (unsigned long)self.jobIndex, (unsigned long)self.jobLines.count];
    if (self.jobIndex % 50 == 0) [self recordEvent:self.jobStatusLabel.stringValue];
    [self sendNextJobLine];
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
    switch (central.state) {
        case CBManagerStatePoweredOn: [self startScan]; break;
        case CBManagerStatePoweredOff: [self setStatusText:@"Bluetooth is off. Turn it on in System Settings."]; break;
        case CBManagerStateUnauthorized:
            [self setStatusText:@"Bluetooth access denied. Allow Laser Link in Privacy & Security settings."]; break;
        case CBManagerStateUnsupported: [self setStatusText:@"Bluetooth is unsupported on this Mac."]; break;
        default: [self setStatusText:@"Bluetooth is unavailable right now."]; break;
    }
}

- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral
     advertisementData:(NSDictionary<NSString *, id> *)advertisementData RSSI:(NSNumber *)RSSI {
    NSString *name = advertisementData[CBAdvertisementDataLocalNameKey] ?: peripheral.name ?: @"Unnamed device";
    NSUInteger index = [self.devices indexOfObjectPassingTest:^BOOL(NSDictionary *device, NSUInteger i, BOOL *stop) {
        return [((CBPeripheral *)device[@"peripheral"]).identifier isEqual:peripheral.identifier];
    }];
    NSMutableDictionary *device = [@{@"name": name, @"rssi": RSSI, @"peripheral": peripheral} mutableCopy];
    if (index == NSNotFound) {
        [self.devices addObject:device];
        if ([name caseInsensitiveCompare:LaserTargetName] == NSOrderedSame) {
            self.targetPeripheralID = peripheral.identifier;
            [self setStatusText:@"Found Laser-22504. Select it and click Connect."];
        }
    }
    else self.devices[index] = device;
    [self.devices sortUsingComparator:^NSComparisonResult(NSDictionary *left, NSDictionary *right) {
        BOOL leftLaser = [left[@"name"] localizedCaseInsensitiveContainsString:@"laser"];
        BOOL rightLaser = [right[@"name"] localizedCaseInsensitiveContainsString:@"laser"];
        if (leftLaser != rightLaser) return leftLaser ? NSOrderedAscending : NSOrderedDescending;
        return [right[@"rssi"] compare:left[@"rssi"]];
    }];
    NSUUID *selectedID = self.selectedPeripheral.identifier;
    [self.deviceTable reloadData];
    if (selectedID) {
        NSUInteger selectedIndex = [self.devices indexOfObjectPassingTest:^BOOL(NSDictionary *item, NSUInteger i, BOOL *stop) {
            return [((CBPeripheral *)item[@"peripheral"]).identifier isEqual:selectedID];
        }];
        if (selectedIndex != NSNotFound) [self.deviceTable selectRowIndexes:[NSIndexSet indexSetWithIndex:selectedIndex]
                                                      byExtendingSelection:NO];
    }
    if (!self.autoConnectAttempted && [name caseInsensitiveCompare:LaserTargetName] == NSOrderedSame) {
        self.autoConnectAttempted = YES;
        self.selectedPeripheral = peripheral;
        self.scanGeneration++;
        [self.central stopScan];
        self.scanButton.title = @"Scan Again";
        peripheral.delegate = self;
        [self refreshDetails];
        [self setStatusText:@"Found Laser-22504. Connecting to inspect services…"];
        [self.central connectPeripheral:peripheral options:nil];
    }
}

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral {
    self.grblVerified = NO;
    self.readOnlyProbeSent = NO;
    self.statusProbeSent = NO;
    self.statusWriteOutstanding = NO;
    self.probeWriteOutstanding = NO;
    self.probeReplyOkay = NO;
    self.verifiedPeripheralID = nil;
    self.commandCharacteristic = nil;
    [self.responseBuffer setString:@""];
    [self setStatusText:[NSString stringWithFormat:@"Connected to %@. Discovering services…",
                         peripheral.name ?: @"device"]];
    [self refreshDetails];
    [self updateJobControls];
    [self writeReport];
    [peripheral discoverServices:nil];
}

- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral
                 error:(NSError *)error {
    [self setStatusText:[NSString stringWithFormat:@"Connection failed: %@", error.localizedDescription ?: @"unknown error"]];
    [self updateJobControls];
}

- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral
                 error:(NSError *)error {
    if (self.jobRunning) {
        BOOL wasSelfTesting = self.selfTesting;
        self.jobRunning = NO;
        self.jobPaused = NO;
        self.awaitingIdle = NO;
        self.currentLineData = nil;
        self.deviceTable.enabled = YES;
        self.jobStatusLabel.stringValue = @"Bluetooth disconnected during the job. Stop the machine at its controls.";
        if (wasSelfTesting) {
            self.selfTesting = NO;
            self.jobLines = nil;
            self.jobProgress.doubleValue = 0;
        }
    }
    self.grblVerified = NO;
    self.verifiedPeripheralID = nil;
    self.commandCharacteristic = nil;
    [self setStatusText:error ? [NSString stringWithFormat:@"Disconnected: %@", error.localizedDescription]
                              : @"Disconnected"];
    [self refreshDetails];
    [self updateJobControls];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error {
    if (error) {
        [self setStatusText:[NSString stringWithFormat:@"Service discovery failed: %@", error.localizedDescription]];
        return;
    }
    [self setStatusText:[NSString stringWithFormat:@"Found %lu Bluetooth service(s)",
                         (unsigned long)peripheral.services.count]];
    [self refreshDetails];
    [self writeReport];
    for (CBService *service in peripheral.services) [peripheral discoverCharacteristics:nil forService:service];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service
             error:(NSError *)error {
    if (error) {
        [self setStatusText:[NSString stringWithFormat:@"Characteristic discovery failed: %@", error.localizedDescription]];
        return;
    }
    [self setStatusText:@"Connected. Bluetooth services discovered."];
    for (CBCharacteristic *characteristic in service.characteristics) {
        if ([service.UUID.UUIDString isEqualToString:@"FFF0"] &&
            [characteristic.UUID.UUIDString isEqualToString:@"FFF2"]) {
            self.commandCharacteristic = characteristic;
        }
        if (characteristic.properties & CBCharacteristicPropertyRead) {
            [peripheral readValueForCharacteristic:characteristic];
        }
        if (characteristic.properties & CBCharacteristicPropertyNotify) {
            [peripheral setNotifyValue:YES forCharacteristic:characteristic];
        }
    }
    [self refreshDetails];
    [self writeReport];
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic
             error:(NSError *)error {
    if (error) {
        [self recordEvent:[NSString stringWithFormat:@"Read %@ failed: %@", characteristic.UUID, error.localizedDescription]];
        return;
    }
    NSData *value = characteristic.value;
    if ([characteristic.UUID.UUIDString isEqualToString:@"FFF1"]) {
        [self handleGrblData:value];
        if (!self.jobRunning) {
            [self refreshDetails];
            [self writeReport];
        }
        return;
    }
    NSString *text = [[NSString alloc] initWithData:value encoding:NSUTF8StringEncoding];
    [self recordEvent:[NSString stringWithFormat:@"%@ value: %@", characteristic.UUID,
                       text ?: value.description]];
    [self refreshDetails];
    [self writeReport];
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic
             error:(NSError *)error {
    [self recordEvent:error
     ? [NSString stringWithFormat:@"Notifications %@ failed: %@", characteristic.UUID, error.localizedDescription]
     : [NSString stringWithFormat:@"Notifications %@: %@", characteristic.UUID,
        characteristic.isNotifying ? @"on" : @"off"]];
    if (!error && characteristic.isNotifying &&
        [characteristic.UUID.UUIDString isEqualToString:@"FFF1"] &&
        self.commandCharacteristic && !self.statusProbeSent) {
        self.statusProbeSent = YES;
        self.statusWriteOutstanding = YES;
        NSData *query = [@"?" dataUsingEncoding:NSASCIIStringEncoding];
        [peripheral writeValue:query forCharacteristic:self.commandCharacteristic type:CBCharacteristicWriteWithResponse];
        [self recordEvent:@"Sent read-only GRBL status query (?)"];
    }
}

- (void)handleGrblData:(NSData *)data {
    NSString *chunk = [[NSString alloc] initWithData:data encoding:NSASCIIStringEncoding];
    if (!chunk) {
        [self recordEvent:[NSString stringWithFormat:@"Non-ASCII controller reply: %@", data]];
        return;
    }
    [self.responseBuffer appendString:chunk];
    while (YES) {
        NSRange newline = [self.responseBuffer rangeOfString:@"\n"];
        if (newline.location == NSNotFound) break;
        NSString *raw = [self.responseBuffer substringToIndex:newline.location];
        [self.responseBuffer deleteCharactersInRange:NSMakeRange(0, NSMaxRange(newline))];
        NSString *line = [raw stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
        if (line.length) [self handleGrblLine:line];
    }
    if (self.responseBuffer.length > 4096) {
        [self recordEvent:@"Controller reply exceeded 4 KB; buffer cleared"];
        [self.responseBuffer setString:@""];
    }
}

- (void)handleGrblLine:(NSString *)line {
    if ([line hasPrefix:@"<"] && [line hasSuffix:@">"]) {
        if (self.awaitingIdle) {
            if ([line hasPrefix:@"<Alarm"]) {
                [self stopJobWithError:@"Controller entered Alarm. Check the machine and reconnect."];
                return;
            }
            if ([line hasPrefix:@"<Idle"]) {
                self.awaitingIdle = NO;
                self.jobRunning = NO;
                self.deviceTable.enabled = YES;
                if (self.selfTesting) {
                    self.selfTesting = NO;
                    self.jobLines = nil;
                    self.jobProgress.doubleValue = 0;
                    self.jobStatusLabel.stringValue = @"Bluetooth sender verified. Open a job file.";
                    [self recordEvent:@"Read-only sender self-test passed"];
                } else {
                    self.jobStatusLabel.stringValue = @"Job complete. Machine is idle.";
                    [self recordEvent:@"Job complete; controller reports Idle"];
                }
                [self updateJobControls];
            }
            return;
        }
        [self recordEvent:[NSString stringWithFormat:@"GRBL status: %@", line]];
        if (!self.readOnlyProbeSent && self.commandCharacteristic) {
            self.readOnlyProbeSent = YES;
            self.probeWriteOutstanding = YES;
            NSData *probe = [@"$G\n" dataUsingEncoding:NSASCIIStringEncoding];
            [self.selectedPeripheral writeValue:probe forCharacteristic:self.commandCharacteristic
                                           type:CBCharacteristicWriteWithResponse];
            [self recordEvent:@"Sent read-only GRBL modal-state query ($G)"];
        }
        return;
    }
    if ([line caseInsensitiveCompare:@"ok"] == NSOrderedSame) {
        if (!self.grblVerified && self.readOnlyProbeSent) {
            self.probeReplyOkay = YES;
            [self verifyProbeIfReady];
        } else if (self.jobRunning && self.currentLineData) {
            self.lineAckReceived = YES;
            [self finishCurrentLine];
        }
        return;
    }
    if ([line hasPrefix:@"error:"] || [line hasPrefix:@"ALARM:"]) {
        if (self.jobRunning) {
            [self stopJobWithError:[NSString stringWithFormat:@"Controller rejected command %lu: %@",
                                    (unsigned long)(self.jobIndex + 1), line]];
        } else {
            [self recordEvent:line];
        }
        return;
    }
    [self recordEvent:[NSString stringWithFormat:@"GRBL: %@", line]];
}

- (void)verifyProbeIfReady {
    if (!self.probeReplyOkay || self.probeWriteOutstanding || self.grblVerified) return;
    if (![self.selectedPeripheral.identifier isEqual:self.targetPeripheralID]) return;
    self.grblVerified = YES;
    self.verifiedPeripheralID = self.selectedPeripheral.identifier;
    self.jobStatusLabel.stringValue = self.jobLines.count
        ? @"GRBL link verified. Job ready."
        : @"GRBL link verified. Open a job file.";
    [self recordEvent:@"GRBL command acknowledgement verified"];
    [self updateJobControls];
    if (!self.jobLines.count) [self runReadOnlySenderSelfTest];
}

- (void)runReadOnlySenderSelfTest {
    self.selfTesting = YES;
    self.jobLines = @[@"$G"];
    self.jobIndex = 0;
    self.jobRunning = YES;
    self.jobPaused = NO;
    self.awaitingIdle = NO;
    self.jobProgress.maxValue = 1;
    self.jobProgress.doubleValue = 0;
    self.jobStatusLabel.stringValue = @"Checking Bluetooth sender with a read-only command…";
    self.deviceTable.enabled = NO;
    [self recordEvent:@"Starting read-only sender self-test"];
    [self updateJobControls];
    [self sendNextJobLine];
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic
             error:(NSError *)error {
    if (error) {
        if (self.jobRunning) [self stopJobWithError:[NSString stringWithFormat:@"Bluetooth write failed: %@",
                                                      error.localizedDescription]];
        else [self recordEvent:[NSString stringWithFormat:@"Write %@ failed: %@",
                                characteristic.UUID, error.localizedDescription]];
        return;
    }
    if (self.statusWriteOutstanding) {
        self.statusWriteOutstanding = NO;
        [self recordEvent:@"Status query write acknowledged"];
        return;
    }
    if (self.probeWriteOutstanding) {
        self.probeWriteOutstanding = NO;
        [self recordEvent:@"Modal-state query write acknowledged"];
        [self verifyProbeIfReady];
        return;
    }
    if (self.jobRunning && self.writeOutstanding) {
        self.writeOutstanding = NO;
        [self writeNextChunk];
    } else {
        [self recordEvent:[NSString stringWithFormat:@"Write %@ acknowledged", characteristic.UUID]];
    }
}
@end

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        NSApplication *application = [NSApplication sharedApplication];
        LaserApp *delegate = [[LaserApp alloc] init];
        application.delegate = delegate;
        [application run];
    }
    return 0;
}
